import { User } from './user.model';
import { UserRepository } from './user.repository';
import { UserRequest, UserResult } from './user.interface';

export class GetDetailUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(params: UserRequest.getDetailUser): Promise<UserResult.getDetailUser> {
    const response = await this.userRepository.getDetailUser(params);
    return {
      status: {
        code: 'SUCCESS',
        message: 'SUCCESS HIT API',
      },
      data: new User({
        id: response?.id ?? 0,
        firstName: response?.firstName ?? '',
        lastName: response?.lastName ?? '',
        maidenName: response?.maidenName ?? '',
        age: response?.age ?? 0,
        gender: response?.gender ?? '',
        email: response?.email ?? '',
        phone: response?.phone ?? '',
        username: response?.username ?? '',
        password: response?.password ?? '',
        birthDate: response?.birthDate ?? '',
        image: response?.image ?? '',
        bloodGroup: response?.bloodGroup ?? '',
        height: response?.height ?? 0,
        weight: response?.weight ?? 0,
        eyeColor: response?.eyeColor ?? '',
        hair: {
          color: response?.hair?.color ?? '',
          type: response?.hair?.type ?? '',
        },
        ip: response?.ip ?? '',
        address: {
          address: response?.address?.address ?? '',
          city: response?.address?.city ?? '',
          state: response?.address?.state ?? '',
          stateCode: response?.address?.stateCode ?? '',
          postalCode: response?.address?.postalCode ?? '',
          coordinates: {
            lat: response?.address?.coordinates?.lat ?? 0,
            lng: response?.address?.coordinates?.lng ?? 0,
          },
          country: response?.address?.country ?? '',
        },
        macAddress: response?.macAddress ?? '',
        university: response?.university ?? '',
        bank: {
          cardExpire: response?.bank?.cardExpire ?? '',
          cardNumber: response?.bank?.cardNumber ?? '',
          cardType: response?.bank?.cardType ?? '',
          currency: response?.bank?.currency ?? '',
          iban: response?.bank?.iban ?? '',
        },
        company: {
          department: response?.company?.department ?? '',
          name: response?.company?.name ?? '',
          title: response?.company?.title ?? '',
          address: {
            address: response?.company?.address?.address ?? '',
            city: response?.company?.address?.city ?? '',
            state: response?.company?.address?.state ?? '',
            stateCode: response?.company?.address?.stateCode ?? '',
            postalCode: response?.company?.address?.postalCode ?? '',
            coordinates: {
              lat: response?.company?.address?.coordinates?.lat ?? 0,
              lng: response?.company?.address?.coordinates?.lng ?? 0,
            },
            country: response?.company?.address?.country ?? '',
          },
        },
        ein: response?.ein ?? '',
        ssn: response?.ssn ?? '',
        userAgent: response?.userAgent ?? '',
        crypto: {
          coin: response?.crypto?.coin ?? '',
          wallet: response?.crypto?.wallet ?? '',
          network: response?.crypto?.network ?? '',
        },
        role: response?.role ?? '',
      }),
    };
  }
}
