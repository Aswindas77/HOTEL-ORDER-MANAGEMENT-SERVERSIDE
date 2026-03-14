import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { TablesModule } from './tables/tables.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { BranchModule } from './branch/branch.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ActivationRequestModule } from './activation-request/activation-request.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    TablesModule,
    CategoriesModule,
    MenuModule,
    OrdersModule,
    MenuModule,
    DashboardModule,
    CategoriesModule,
    BranchModule,
    SubscriptionModule,
    ActivationRequestModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
