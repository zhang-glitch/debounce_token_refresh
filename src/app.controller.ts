import { UserDto } from './user.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  Request,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';

const users = [
  { username: 'zhanghao', password: '123456', email: 'xxx@xxx.com' },
  { username: 'dong', password: '222222', email: 'yyy@yyy.com' },
];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   *
   * 登录颁发两个token
   */
  @Post('login')
  login(@Body() userDto: UserDto) {
    const user = users.find((item) => item.username === userDto.username);

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== userDto.password) {
      throw new BadRequestException('密码错误');
    }

    // 访问token的过期时间半小时
    const accessToken = this.jwtService.sign(
      {
        username: user.username,
        email: user.email,
      },
      {
        expiresIn: '0.5h',
      },
    );

    // 连续访问时，刷新token的过期时间7天
    const refreshToken = this.jwtService.sign(
      {
        username: user.username,
      },
      {
        expiresIn: '7d',
      },
    );

    return {
      userInfo: {
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   *
   * 登录后访问
   */
  @Get('index')
  index(@Req() req: Request) {
    const authorization = req.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }
    try {
      const token = authorization.split(' ')[1];
      // 验证token
      const data = this.jwtService.verify(token);

      console.log(data);
      return {
        msg: 'hello index',
      };
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }

  /**
   * 刷新token。重新生成token
   *
   * 定义了个 get 接口，参数是 refresh_token
   *
   * 返回了新的 token，这种方式也叫做无感刷新
   */
  @Get('refresh')
  refresh(@Query('token') token: string) {
    try {
      const data = this.jwtService.verify(token);

      const user = users.find((item) => item.username === data.username);

      const accessToken = this.jwtService.sign(
        {
          username: user.username,
          email: user.email,
        },
        {
          expiresIn: '0.5h',
        },
      );

      const refreshToken = this.jwtService.sign(
        {
          username: user.username,
        },
        {
          expiresIn: '7d',
        },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
