# Маълумот дар бораи Backend

Backend-и лоиҳа дар асоси технологияҳои муосири Node.js сохта шудааст.

## Технологияҳо
- **Framework**: [NestJS](https://nestjs.com/) (барои сохтани API-и мустаҳкам ва миқёспазир).
- **ORM**: [Prisma](https://www.prisma.io/) (барои кор бо махзани маълумот).
- **Database**: PostgreSQL (ё дигар махзани SQL-и бо Prisma мувофиқ).
- **Authentication**: JWT (JSON Web Tokens) ва Passport.js.
- **Validation**: class-validator ва class-transformer.
- **Documentation**: Swagger (дар суроғаи `/api/docs` дастрас аст).

## Функсияҳои асосӣ
1. **Идоракунии корбарон**: Бақайдгирӣ ва воридшавӣ (Auth).
2. **Модули молиявӣ**: Ҳисобкунии P&L, идоракунии хазина (cashbox).
3. **Идоракунии анбор**: Баҳисобгирии маҳсулот ва ашёи хом.
4. **Маош ва кормандон**: Модули Payroll барои ҳисоб кардани маоши кормандон.
5. **Ҳисоботҳо**: Генератсияи Excel ва PDF.
