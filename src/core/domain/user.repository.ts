import { UserRequest, UserResponse } from './user.interface';

export abstract class UserRepository {
  abstract getDetailUser(params: UserRequest.getDetailUser): Promise<UserResponse.getDetailUser>;
}
