import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';
import { ScopeCategory } from './scope-category.entity';
import { Organization } from '@/organization/entities/organization.entity';
import { SCOPE_TABLE } from '@/constants/dbTables';
import { UserScope } from './user-scope.entity';

@Entity(SCOPE_TABLE)
export class Scope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.scopes)
  roles: Role[];

  @ManyToMany(() => User, (user) => user.scopes)
  users: User[];

  @ManyToOne(() => Organization, (organization) => organization.scopes, {
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @ManyToOne(() => ScopeCategory, (category) => category.scopes)
  category: ScopeCategory;

  @OneToMany(() => UserScope, (userScope) => userScope.scope)
  userScopes: UserScope[];
}
