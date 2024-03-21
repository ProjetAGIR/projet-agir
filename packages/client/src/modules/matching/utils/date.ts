export const MILL_TO_SEC = 1000;
export const MILL_TO_MIN = MILL_TO_SEC * 60;
export const MILL_TO_HOUR = MILL_TO_MIN * 60;
export const MILL_TO_DAY = MILL_TO_HOUR * 24;

export interface RelativeDateOptions {
    allowPast: boolean;
    allowFuture: boolean;
}

export interface RelativeDateLocals {
    days: string;
    day: string;
    hours: string;
    hour: string;
    minutes: string;
    minute: string;
    now: string;
    future: string;
    past: string;
    in: string;
    and: string;
    ago: string;
    at: string;
}

export const DEFAULT_RELATIVE_DATE_OPTIONS: RelativeDateOptions = {
    allowPast: true,
    allowFuture: true,
};

export const RELATIVE_DATE_LOCALS_FR: RelativeDateLocals = {
    days: 'jours',
    day: 'jour',
    hours: 'heures',
    hour: 'heure',
    minutes: 'minutes',
    minute: 'minute',
    now: 'Maintenant',
    future: 'À venir',
    past: 'Passé',
    in: 'Dans',
    and: 'et',
    ago: 'passé',
    at: 'à',
};

export const toRelativeDateString = (
    date: Date,
    options: Partial<RelativeDateOptions> = {},
    locals: RelativeDateLocals = RELATIVE_DATE_LOCALS_FR,
): string => {
    const { allowPast, allowFuture } = {
        ...DEFAULT_RELATIVE_DATE_OPTIONS,
        ...options,
    };

    let diff = date.getTime() - Date.now();

    let prefix = '';
    let suffix = '';

    if (diff >= 0) {
        if (allowFuture) {
            prefix = `${locals.in} `;
        } else {
            return locals.future;
        }
    } else {
        diff = -diff;
        if (allowPast) {
            suffix = ` ${locals.ago}`;
        } else {
            return locals.past;
        }
    }

    if (diff > MILL_TO_DAY * 7) {
        // More than a week, display the date
        return (
            (date.getFullYear() === new Date().getFullYear()
                ? date.toLocaleDateString('fr', {
                      day: 'numeric',
                      month: 'long',
                  })
                : date.toLocaleDateString('fr', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                  })) +
            ` ${locals.at} ${date.toLocaleTimeString('fr', {
                hour: 'numeric',
                minute: 'numeric',
            })}`
        );
    } else if (diff > MILL_TO_DAY * 2) {
        // More than 2 days, display the number of days
        return `${prefix}${Math.floor(diff / MILL_TO_DAY)} ${
            locals.days
        }${suffix}`;
    } else if (diff > MILL_TO_DAY) {
        // More than a day, display the number of days and hours
        const days = Math.floor(diff / MILL_TO_DAY);
        const hours = Math.floor((diff % MILL_TO_DAY) / MILL_TO_HOUR);

        return `${prefix}${days} ${days > 1 ? locals.days : locals.day} ${
            locals.and
        } ${hours} ${hours > 1 ? locals.hours : locals.hour}${suffix}`;
    } else if (diff > MILL_TO_HOUR * 2) {
        // More than 2 hours, display the number of hours
        return `${prefix}${Math.floor(diff / MILL_TO_HOUR)} ${
            locals.hours
        }${suffix}`;
    } else if (diff > MILL_TO_HOUR) {
        // More than an hour, display the number of hours and minutes
        const hours = Math.floor(diff / MILL_TO_HOUR);
        const minutes = Math.floor((diff % MILL_TO_HOUR) / MILL_TO_MIN);

        return `${prefix}${hours} ${hours > 1 ? locals.hours : locals.hour} ${
            locals.and
        } ${minutes} ${minutes > 1 ? locals.minutes : locals.minute}${suffix}`;
    } else if (diff > MILL_TO_MIN * 2) {
        // More than 2 minutes, display the number of minutes
        return `${prefix}${Math.floor(diff / MILL_TO_MIN)} ${
            locals.minutes
        }${suffix}`;
    } else {
        // Less than 2 minutes, display "maintenant"
        return locals.now;
    }
};
