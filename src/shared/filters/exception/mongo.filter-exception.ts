import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoFilter implements ExceptionFilter {
    catch(exception: MongoError, host: ArgumentsHost) {
        console.log(exception);
        const response = host.switchToHttp().getResponse();
        console.log(exception);
        if (exception.code === 11000) {
            response.status(400).json({ message: 'E-mail já registrado!' });
        } else {
            response.status(500).json({ message: 'Erro no Servidor! Recarregue a página e tente novamente!' });
        }
    }
}