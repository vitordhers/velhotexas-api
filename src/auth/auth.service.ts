import {
  Injectable,
  HttpService,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { map } from "rxjs/operators";
import { EmailService } from "src/email/email.service";
import { TokensService } from "./tokens.service";
import { User } from "../shared/models/user.model";
import { CreateUserDto } from "./dtos/create-user.dto";
import { AuthCredentialsDto } from "./dtos/auth-credentials.dto";
import { PasswordFromOrderDto } from "./dtos/password-from-order.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { UserStatus } from "../shared/enums/user-status.enum";
import { Providers } from "./enums/providers.enum";
import { Credentials } from "./interfaces/credentials.interface";
import { ReturnModelType } from "@typegoose/typegoose";
import { Address } from "src/users/models/address.model";
import { Types } from "mongoose";
import { Notificate } from "src/shared/models/notificate.model";
import { genSalt, hash } from "bcryptjs";
import { PasswordFromEmailDto } from "./dtos/password-from-email.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private readonly http: HttpService,
    private readonly emailService: EmailService,
    private readonly tokensService: TokensService
  ) { }

  public async signUp(
    createUserDto: CreateUserDto
  ): Promise<Credentials> | null {
    const {
      name,
      email,
      passwords,
      birthday,
      celphoneNumber,
      whatsapp,
      communication,
    } = createUserDto;

    const salt = await genSalt(12);
    const password = await hash(passwords.password, salt);
    const notifications: Notificate[] = [
      {
        notId: Types.ObjectId(),
        read: false,
        date: new Date(),
        text: `🅰️🅾🅱🅰❗SEJE benvenido ao Velho Texas, <b>${name}</b>!🤠 Num se esqueça de confirmar seu e-mail <b>${email}</b>.
            <br> Apoi, você num recebeu e quer que a gente reenvie?🤔 Clica aqui memu!💥`,
        url: "/usuario/configuracoes",
      },
    ];
    const newUser = new this.userModel({
      name,
      email,
      password,
      salt,
      birthday,
      celphoneNumber,
      whatsapp,
      communication,
      status: UserStatus.REGISTERED,
      addresses: [],
      orders: [],
      notifications,
      blackListEmailTokens: [],
    });

    const result = await newUser.save();

    if (result) {
      this.emailService.sendConfirmationEmail(email, false);
    }

    const payload: JwtPayload = {
      id: result._id,
      role: "user",
      access: "full",
    };

    return await this.tokensService.createTokens(payload);
  }

  public async signIn(
    authCredentialsDto: AuthCredentialsDto
  ): Promise<{ credentials: Credentials; notifications: { new: number } }> {
    const { email, password } = authCredentialsDto;
    const user = await this.userModel
      .findOne({ email }, { email: 1, password: 1, salt: 1, notifications: 1 })
      .exec();

    if (!user) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const hashedpassword = await hash(password, user.salt);

    if (hashedpassword !== user.password) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }
    const newLength = user.notifications.filter(
      (notification) => notification.read === false
    ).length;
    const notifications = { new: newLength };
    const payload: JwtPayload = {
      id: user._id,
      role: "user",
      access: "full",
    };

    const credentials = await this.tokensService.createTokens(payload);
    return { credentials, notifications };
  }

  async signUpOAuthLogin(
    createUserDto: CreateUserDto,
    provider: Providers
  ): Promise<Credentials> {
    try {
      const { email, name, googleUserId, facebookUserId } = createUserDto;

      let result;

      if (provider === "google" && googleUserId != undefined) {
        result = await this.userModel
          .updateOne(
            { email },
            {
              $set: { googleUserId, email, name },
              $setOnInsert: { status: UserStatus.OAUTHREGISTERED },
            },
            { upsert: true }
          )
          .exec();
      } else if (provider === "facebook" && facebookUserId != undefined) {
        result = await this.userModel
          .updateOne(
            { email },
            {
              $set: { facebookUserId, email, name },
              $setOnInsert: { status: UserStatus.OAUTHREGISTERED },
            },
            { upsert: true }
          )
          .exec();
      }

      if (result.upserted) {
        this.emailService.sendConfirmationEmail(email, false);
      }

      const user = await this.userModel.findOne({ email });
      const payload: JwtPayload = {
        id: user._id,
        role: "user",
        access: "full",
      };

      return await this.tokensService.createTokens(payload);
    } catch (err) {
      throw new InternalServerErrorException("validateOAuthLogin", err.message);
    }
  }

  async signUpOrder(
    email: string,
    name: string,
    preAddress: {
      postalCode: string;
      street: string;
      no: number;
      city: string;
      state: string;
      addInfo?: string;
    }
  ) {
    const address = new Address(
      Types.ObjectId(),
      preAddress.postalCode,
      preAddress.street,
      preAddress.no,
      preAddress.city,
      preAddress.state,
      true,
      preAddress.addInfo
    );
    const notifications = [];
    const newUser = new this.userModel({
      name,
      email,
      status: UserStatus.REGISTERED_BY_ORDER,
      addresses: [address],
      orders: [],
      notifications,
      blackListEmailTokens: [],
    });

    const result: any = await newUser.save();

    if (result) {
      // send order email
      // CASO VOCÊ JÁ NÃO TENHA CADASTRADO UMA SENHA ...
      // this.emailService.sendConfirmationEmail(email, false);
    } else {
      throw new InternalServerErrorException();
    }

    const payload: JwtPayload = {
      id: result._id,
      role: "user",
      access: "low",
    };

    const token = await this.tokensService.createAccessToken(payload);

    result._doc = { ...result._doc, numberOfOrders: 0 };
    return { ...result._doc, token: token.accessToken };
  }

  public async getUserStatus(email: string) {
    const user = await this.userModel.find(
      {
        email,
      },
      {
        status: 1,
      }
    );
    if (!user) {
      throw new NotFoundException("E-mail não cadastrado.");
    }
    return user;
  }

  public async getUserNewNotifications(_id: string) {
    const result: [{ new: number }] = await this.userModel
      .aggregate([
        { $unwind: "$notifications" },
        {
          $match: {
            $and: [
              { _id: Types.ObjectId(_id) },
              { "notifications.read": false },
            ],
          },
        },
        {
          $count: "new",
        },
        {
          $project: {
            new: 1,
          },
        },
      ])
      .exec();
    if (result && result[0]) {
      return result;
    } else {
      return null;
    }
  }

  public async confirmUserEmail(
    _id: string,
    blackListEmailTokens: string,
    passwordFromEmailDto?: PasswordFromEmailDto
  ): Promise<{ email: string; status: UserStatus }> {
    let $match: any = {
      _id: Types.ObjectId(_id),
      status: {
        $in: [
          UserStatus.REGISTERED_BY_ORDER,
          UserStatus.OAUTHREGISTERED,
          UserStatus.REGISTERED,
        ],
      },
    };
    let $set: any = { status: UserStatus.REGISTERED_AND_CONFIRMED };
    if (passwordFromEmailDto) {
      const { passwords } = passwordFromEmailDto;
      const salt = await genSalt(12);
      const password = await hash(passwords.password, salt);
      $match = {
        ...$match,
        password: { $exists: false },
        salt: { $exists: false },
      };
      $set = { ...$set, password, salt };
    }
    const result = await this.userModel
      .findOneAndUpdate(
        $match,
        {
          $set,
          $push: { blackListEmailTokens },
        },
        { new: true }
      )
      .exec();
    if (result) {
      return {
        email: result.email,
        status: UserStatus.REGISTERED_AND_CONFIRMED,
      };
    } else {
      throw new BadRequestException("Não foi possível confirmar o e-mail.");
    }
  }

  public async passwordFromOrder(
    _id: string,
    passwordFromOrderDto: PasswordFromOrderDto
  ) {
    const { passwords, orderId, promo } = passwordFromOrderDto;
    const salt = await genSalt(12);
    const password = await hash(passwords.password, salt);

    const result = await this.userModel
      .findOneAndUpdate(
        {
          _id: Types.ObjectId(_id),
          status: UserStatus.REGISTERED_BY_ORDER,
          "orders.orderId": Types.ObjectId(orderId),
        },
        {
          $set: {
            status: UserStatus.REGISTERED,
            password,
            salt,
            communication: { mailcomm: promo, wppcomm: false },
          },
        },
        { new: true }
      )
      .exec();

    if (result) {
      const mailsent = this.emailService.sendConfirmationEmail(
        result.email,
        false
      );
      if (mailsent) {
        const maskedEmail = this.hashEmail(result.email);
        return { email: maskedEmail };
      }
    } else {
      throw new NotFoundException();
    }
  }

  public hashEmail(email: string) {
    const mailsplit = email.split("@", 2);
    let offset = Math.floor(mailsplit[0].length / 2);
    const first = mailsplit[0].substring(
      mailsplit[0].length - offset,
      mailsplit[0].length
    );
    mailsplit[0] = mailsplit[0].replace(first, "*".repeat(offset));
    return mailsplit.join("@");
  }

  public async updatePassword(email: string, pass: string) {
    const salt = await genSalt(12);
    const password = await hash(pass, salt);

    const result = await this.userModel
      .updateOne({ email }, { $set: { password } })
      .exec();

    return result;
  }

  public async googleRecaptchaCheck(
    response: string,
    remoteip?: string
  ): Promise<boolean> {
    const secret_key = process.env.GOOGLE_RECAPTCHA_SECRET;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response}`;
    return await this.http
      .post(url)
      .pipe(map((r) => (r.data.score > 0.7 ? true : false)))
      .toPromise();
  }

  public async resendConfirmationEmail(_id: string) {
    const result = await this.userModel
      .findOne({
        _id: Types.ObjectId(_id),
        status: {
          $in: [
            UserStatus.REGISTERED_BY_ORDER,
            UserStatus.REGISTERED,
            UserStatus.OAUTHREGISTERED,
          ],
        },
      })
      .exec();
    if (result) {
      const mailsent = this.emailService.sendConfirmationEmail(
        result.email,
        true
      );
      return { email: result.email };
    } else {
      throw new NotFoundException("Email inexistente ou já confirmado.");
    }
  }

  public async forgotPassword(email: string) {
    const result = await this.userModel
      .findOne(
        {
          email,
          status: { $ne: UserStatus.DISABLED },
        },
        {
          email: 1,
          status: 1,
          password: 1,
        }
      )
      .exec();
    if (!result) {
      throw new NotFoundException("E-mail não cadastrado.");
    }
    const response = await this.emailService.forgotPasswordEmail(
      result.email,
      result.password,
      result.status
    );
    if (response) {
      return { email };
    }
  }

  public async redefinePassword(
    _id: string,
    passwordFromEmailDto: PasswordFromEmailDto,
    blackListEmailTokens: string
  ) {
    const salt = await genSalt(12);
    const password = await hash(passwordFromEmailDto.passwords.password, salt);
    const result = await this.userModel
      .findOneAndUpdate(
        {
          _id: Types.ObjectId(_id),
        },
        {
          $set: { password, salt },
          $push: { blackListEmailTokens },
        }
      )
      .exec();

    if (result) {
      return { success: true };
    } else {
      return { success: false };
    }
  }

  public async resendConfirmationEmailOffline(email: string) {
    const result = await this.userModel
      .findOne({
        email,
        status: {
          $in: [
            UserStatus.REGISTERED_BY_ORDER,
            UserStatus.REGISTERED,
            UserStatus.OAUTHREGISTERED,
          ],
        },
      })
      .exec();
    if (result) {
      const mailsent = this.emailService.sendConfirmationEmail(
        result.email,
        true
      );
      return { email: result.email };
    } else {
      throw new NotFoundException("Email inexistente ou já confirmado.");
    }
  }
}
