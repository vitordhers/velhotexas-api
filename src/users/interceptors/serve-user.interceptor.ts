import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { classToPlain } from "class-transformer";

@Injectable()
export class ServeUserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => classToPlain(this.transform(data))));
    }

    transform(data) {
        return Array.isArray(data) ? data.map(obj => obj.toObject()) : data.toObject();
    }
}