import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(
        private readonly http: HttpClient,
        private readonly swPush: SwPush,
    ) {}

    subscribe(userId: number) {
        const notification = Notification;
        if (notification.permission === 'denied') {
            this.http.post(`/notification/unsubscribe`, { userId });
            return;
        }

        this.swPush
            .requestSubscription({
                serverPublicKey: environment.notifications.vapidPublicKey,
            })
            .then((sub) => {
                this.http
                    .post(`/notification/subscribe`, { userId, sub })
                    .subscribe();
            });
    }
}
