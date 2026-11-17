import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DishEntity } from '../../dishes/entities/dish.entity.js';

@Entity('allergens')
export class AllergenEntity {
  @ApiProperty({
    format: 'uuid',
    example: '8feaaeaf-a88b-4d9d-9c24-b50fb2029320',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Глютен' })
  @Column({ type: 'varchar', length: 60, unique: true })
  name: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToMany(() => DishEntity, (dish) => dish.allergens)
  dishes: DishEntity[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
