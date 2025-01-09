import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Scope } from './scope.entity';
import { SCOPE_CATEGORY_TABLE } from '@/constants/dbTables';

@Entity(SCOPE_CATEGORY_TABLE)
export class ScopeCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Scope, (scope) => scope.category)
  scopes: Scope[];
}
