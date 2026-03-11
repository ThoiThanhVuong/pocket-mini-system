import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { IUserRepository } from "../../core/interfaces/repositories/user.repository.interface";
import { Email } from "../../core/domain/value-objects/email.value-object";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private configService: ConfigService,
      @Inject('IUserRepository')
      private readonly userRepository: IUserRepository
    ) {
    const secret = configService.get<string>('JWT_SECRET');
    if(!secret){
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

   async validate(payload: any) {
    // [FIX] Convert string to Email VO
    const user = await this.userRepository.findByEmail(new Email(payload.email));
    if (!user) {
        throw new UnauthorizedException();
    }
    // Return the full user domain object which now includes roles and permissions
    return user;
}
}