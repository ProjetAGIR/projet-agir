export const MILL_TO_SEC = 1000;
export const MILL_TO_MIN = MILL_TO_SEC * 60;
export const MILL_TO_HOUR = MILL_TO_MIN * 60;
export const MILL_TO_DAY = MILL_TO_HOUR * 24;

export interface RelativeDateOptions {
    allowPast: boolean;
    allowFuture: boolean;
    alwaysRelative: boolean;
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
    alwaysRelative: false,
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
    locals: Partial<RelativeDateLocals> = {},
): string => {
    const { allowPast, allowFuture } = {
        ...DEFAULT_RELATIVE_DATE_OPTIONS,
        ...options,
    };
    const fullLocals: RelativeDateLocals = {
        ...RELATIVE_DATE_LOCALS_FR,
        ...locals,
    };

    let diff = date.getTime() - Date.now();

    let prefix = '';
    let suffix = '';

    if (diff >= 0) {
        if (allowFuture) {
            prefix = `${fullLocals.in} `;
        } else {
            return fullLocals.future;
        }
    } else {
        diff = -diff;
        if (allowPast) {
            suffix = ` ${fullLocals.ago}`;
        } else {
            return fullLocals.past;
        }
    }

    if (diff > MILL_TO_DAY * 7 && !options.alwaysRelative) {
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
            ` ${fullLocals.at} ${date.toLocaleTimeString('fr', {
                hour: 'numeric',
                minute: 'numeric',
            })}`
        );
    } else if (diff > MILL_TO_DAY * 2) {
        // More than 2 days, display the number of days
        return `${prefix}${Math.floor(diff / MILL_TO_DAY)} ${
            fullLocals.days
        }${suffix}`;
    } else if (diff > MILL_TO_DAY) {
        // More than a day, display the number of days and hours
        const days = Math.floor(diff / MILL_TO_DAY);
        const hours = Math.floor((diff % MILL_TO_DAY) / MILL_TO_HOUR);

        return `${prefix}${days} ${
            days > 1 ? fullLocals.days : fullLocals.day
        } ${fullLocals.and} ${hours} ${
            hours > 1 ? fullLocals.hours : fullLocals.hour
        }${suffix}`;
    } else if (diff > MILL_TO_HOUR * 2) {
        // More than 2 hours, display the number of hours
        return `${prefix}${Math.floor(diff / MILL_TO_HOUR)} ${
            fullLocals.hours
        }${suffix}`;
    } else if (diff > MILL_TO_HOUR) {
        // More than an hour, display the number of hours and minutes
        const hours = Math.floor(diff / MILL_TO_HOUR);
        const minutes = Math.floor((diff % MILL_TO_HOUR) / MILL_TO_MIN);

        return `${prefix}${hours} ${
            hours > 1 ? fullLocals.hours : fullLocals.hour
        } ${fullLocals.and} ${minutes} ${
            minutes > 1 ? fullLocals.minutes : fullLocals.minute
        }${suffix}`;
    } else if (diff > MILL_TO_MIN * 2) {
        // More than 2 minutes, display the number of minutes
        return `${prefix}${Math.floor(diff / MILL_TO_MIN)} ${
            fullLocals.minutes
        }${suffix}`;
    } else {
        // Less than 2 minutes, display "maintenant"
        return fullLocals.now;
    }
};
