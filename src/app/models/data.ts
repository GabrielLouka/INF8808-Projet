export interface AttackData {
    year: number;
    month: number;
    day: number;
    state: string;
    city: string;
}

export enum DataField {
    AttackType = 'attacktype1_txt',
    TargetType = 'targtype1_txt',
    WeaponType = 'weaptype1_txt',
}
