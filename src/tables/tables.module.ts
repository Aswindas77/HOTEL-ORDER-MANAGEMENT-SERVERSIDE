import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { Table, TableSchema } from './schema/table.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Branch, BranchSchema } from 'src/branch/schema/branch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Table.name, schema: TableSchema },
      { name: User.name, schema: UserSchema },
      { name: Branch.name, schema: BranchSchema },
    ]),
  ],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule { }
