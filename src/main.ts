import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { useContainer, Validator } from "class-validator";
import { config } from "dotenv";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      validationError: { target: false },
    })
  );
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
  let result = config();
  if (result.error) {
    throw result.error;
  }
}
bootstrap();
