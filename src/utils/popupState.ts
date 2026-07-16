const SUPPRESSION_MONTHS = 1;

type PopupStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createPopupSuppressedUntil(now: Date = new Date()): string {
    const suppressedUntil = new Date(now);
    suppressedUntil.setMonth(suppressedUntil.getMonth() + SUPPRESSION_MONTHS);
    return suppressedUntil.toISOString();
}

export function suppressPopupForOneMonth(
    storage: PopupStorage,
    key: string,
    now: Date = new Date(),
): void {
    storage.setItem(key, createPopupSuppressedUntil(now));
}

export function isPopupSuppressed(
    storage: PopupStorage,
    key: string,
    now: Date = new Date(),
): boolean {
    const storedValue = storage.getItem(key);

    if (!storedValue) {
        return false;
    }

    const suppressedUntil = new Date(storedValue);

    if (Number.isNaN(suppressedUntil.getTime()) || suppressedUntil <= now) {
        storage.removeItem(key);
        return false;
    }

    return true;
}
