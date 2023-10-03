import { singleton } from 'tsyringe';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { WsClientFun, WsServer, WsServerFun } from 'common/models/ws';
import { TwoWayMap } from '../../utils/two-way-map';
import { TypeOfId } from 'common/types/id';
import { User } from 'common/models/user';

@singleton()
export class WsService {
    private ws: Server<WsClientFun, WsServerFun> | undefined;
    private clients: TwoWayMap<TypeOfId<User>, string> = new TwoWayMap();
    private authenticationValidation:
        | ((token: string, socket: Socket) => Promise<void>)
        | undefined;

    instantiate(server: http.Server) {
        this.ws = new Server(server, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
        });

        this.ws.on('connection', async (socket) => {
            const token: string | undefined = socket.handshake.auth.token;

            if (!token) {
                return socket.disconnect();
            }

            if (!this.authenticationValidation) {
                throw new Error('Authentication validation not registered');
            }

            try {
                await this.authenticationValidation(token, socket);
            } catch {
                return socket.disconnect();
            }
        });
    }

    registerAuthenticationValidation(
        validation: (token: string, socket: Socket) => Promise<void>,
    ) {
        this.authenticationValidation = validation;
    }

    connectClient(userId: number, socketId: string) {
        this.clients.set(userId, socketId);
    }

    disconnectSocket(socketId: string) {
        this.clients.removeRight(socketId);
    }

    get server() {
        if (!this.ws) {
            throw new Error('Websocket server not instantiated');
        }
        return this.ws;
    }

    emit<T extends keyof WsServer>(event: T, data: WsServer[T]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.server.emit as any)(event, data);
    }

    emitToUser<T extends keyof WsServer>(
        userId: TypeOfId<User>,
        event: T,
        data: WsServer[T],
    ) {
        const socketId = this.clients.getLeft(userId);
        if (!socketId) {
            throw new Error('User not connected');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.server.to(socketId).emit as any)(event, data);
    }

    emitToUserIfConnected<T extends keyof WsServer>(
        userId: TypeOfId<User>,
        event: T,
        data: WsServer[T],
    ) {
        const socketId = this.clients.getLeft(userId);
        if (!socketId) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.server.to(socketId).emit as any)(event, data);
    }
}
