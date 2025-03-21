export enum TargetCategory {
    GovernmentAndSecurity = 'Gouvernement et sécurité',
    PrivateSectorAndMedia = 'Secteur privé et médias',
    InfrastructureAndTransport = 'Infrastructures et transports',
    CiviliansAndSocialInstitutions = 'Civils et institutions sociales',
    Others = 'Autres',
}

export const TARGET_CATEGORY_MAPPING: { [key: string]: TargetCategory } = {
    'Abortion Related': TargetCategory.Others,
    'Airports & Aircraft': TargetCategory.InfrastructureAndTransport,
    Business: TargetCategory.PrivateSectorAndMedia,
    'Educational Institution': TargetCategory.CiviliansAndSocialInstitutions,
    'Food or Water Supply': TargetCategory.InfrastructureAndTransport,
    'Government (Diplomatic)': TargetCategory.GovernmentAndSecurity,
    'Government (General)': TargetCategory.GovernmentAndSecurity,
    'Journalists & Media': TargetCategory.PrivateSectorAndMedia,
    Maritime: TargetCategory.InfrastructureAndTransport,
    Military: TargetCategory.GovernmentAndSecurity,
    NGO: TargetCategory.CiviliansAndSocialInstitutions,
    Police: TargetCategory.GovernmentAndSecurity,
    'Private Citizens & Property':
        TargetCategory.CiviliansAndSocialInstitutions,
    'Religious Figures/Institutions':
        TargetCategory.CiviliansAndSocialInstitutions,
    Telecommunication: TargetCategory.InfrastructureAndTransport,
    'Terrorists/Non-State Militia': TargetCategory.Others,
    Tourists: TargetCategory.CiviliansAndSocialInstitutions,
    Transportation: TargetCategory.InfrastructureAndTransport,
    Utilities: TargetCategory.InfrastructureAndTransport,
    'Violent Political Party': TargetCategory.Others,
};
