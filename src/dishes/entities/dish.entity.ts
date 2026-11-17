import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { AllergenEntity } from '../../allergens/entities/allergen.entity.js';
import { MenuCategoryEntity } from '../../menu-categories/entities/menu-category.entity.js';

const decimalToNumber: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};

@Entity('dishes')
export class DishEntity {
  @ApiProperty({
    format: 'uuid',
    example: '2bef71da-bafc-4bb0-b482-76eec220e1ce',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Український борщ із пампушками' })
  @Column({ type: 'varchar', length: 120 })
  title: string;

  @ApiProperty({ example: 'ukrayinskyi-borshch-iz-pampushkamy' })
  @Column({ type: 'varchar', length: 160, unique: true })
  slug: string;

  @ApiProperty({ example: 195 })
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    transformer: decimalToNumber,
  })
  price: number;

  @ApiProperty({ example: 400 })
  @Column({ type: 'integer' })
  weightGrams: number;

  @ApiProperty({ example: 380 })
  @Column({ type: 'integer' })
  calories: number;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  isSpicy: boolean;

  @ApiPropertyOptional({ type: () => MenuCategoryEntity, nullable: true })
  @ManyToOne(() => MenuCategoryEntity, (category) => category.dishes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'menu_category_id' })
  menuCategory: Relation<MenuCategoryEntity> | null;

  @ApiProperty({ type: () => [AllergenEntity] })
  @ManyToMany(() => AllergenEntity, (allergen) => allergen.dishes, {
    cascade: true,
  })
  @JoinTable({
    name: 'dish_allergens',
    joinColumn: { name: 'dish_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'allergen_id', referencedColumnName: 'id' },
  })
  allergens: AllergenEntity[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ApiProperty({ nullable: true, type: Date, example: null })
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;
}
