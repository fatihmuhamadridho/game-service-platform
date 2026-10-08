import { UserRepository } from '@core/domain/user.repository';
import { UserRequest, UserResponse } from '@core/domain/user.interface';
import { AxiosService } from '@services/axios.service';
import { handleHttpError } from '@utils/handleHttpError.util';

type HttpErrorLike = Parameters<typeof handleHttpError>[0];

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly axiosService: AxiosService) {}

  async getDetailUser(params: UserRequest.getDetailUser): Promise<UserResponse.getDetailUser> {
    try {
      const response: UserResponse.getDetailUser = await this.axiosService.get(`/users/${encodeURIComponent(params.id)}`);
      return response;
    } catch (error) {
      handleHttpError(error as HttpErrorLike, 'Something went wrong');
    }
  }
}
