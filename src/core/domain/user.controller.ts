import { UserRepositoryImpl } from '@core/infrastructure/user.repository.impl';
import { AxiosService } from '@services/axios.service';
import { GetDetailUserUseCase } from './user.usecase';
import { UserRequest } from './user.interface';

export class UserController {
  private readonly axiosService: AxiosService;
  private readonly userRepositoryImpl: UserRepositoryImpl;

  private readonly getDetailUserUseCase: GetDetailUserUseCase;

  constructor() {
    this.axiosService = new AxiosService();
    this.userRepositoryImpl = new UserRepositoryImpl(this.axiosService);

    this.getDetailUserUseCase = new GetDetailUserUseCase(this.userRepositoryImpl);
  }

  getDetailUser(params: UserRequest.getDetailUser) {
    return this.getDetailUserUseCase.execute(params);
  }
}
