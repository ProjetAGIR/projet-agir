import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Knex } from 'knex';
import { NotificationSubscription } from 'common/models/notification-subscription';
import { sendNotification, PushSubscription, setVapidDetails } from 'web-push';
import { env } from '../../utils/environment';

@singleton()
export class NotificationService {
    payload = {
        notification: {
            title: 'Test Notification',
            body: '',
            data: {
                onActionClick: {
                    default: {
                        operation: 'focusLastFocusedOrOpen',
                        url: env.CLIENT_URL,
                    },
                },
            },
        },
    };

    constructor(private readonly databaseService: DatabaseService) {}

    private get subscriptions(): Knex.QueryBuilder<NotificationSubscription> {
        return this.databaseService.database<NotificationSubscription>(
            'notification-subscription',
        );
    }

    async subscribe(userId: number, sub: PushSubscription): Promise<void> {
        await this.subscriptions.delete().where({ userId });
        const subscription: NotificationSubscription = {
            endpoint: sub.endpoint,
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh,
            userId: userId,
        };
        await this.subscriptions.insert(subscription);
    }

    async unsubscribe(userId: number): Promise<void> {
        await this.subscriptions.delete().where({ userId });
    }

    async notifyUser(
        userId: number,
        title: string,
        endpoint?: string,
        text?: string,
    ): Promise<void> {
        endpoint ||= '';
        setVapidDetails(
            `mailto:projet.agir.2024@gmail.com`,
            env.VAPID_PUBLIC_KEY,
            env.VAPID_PRIVATE_KEY,
        );
        const sub: NotificationSubscription = await this.subscriptions
            .where({
                userId,
            })
            .first();
        if (sub) {
            const subscription: PushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh,
                },
            };
            this.payload.notification.title = title;
            this.payload.notification.body = text || '';
            this.payload.notification.data.onActionClick.default.url =
                env.CLIENT_URL + endpoint;
            try {
                await sendNotification(
                    subscription,
                    JSON.stringify(this.payload),
                );
            } catch (error) {
                /* empty */
            }
        }
    }
}
