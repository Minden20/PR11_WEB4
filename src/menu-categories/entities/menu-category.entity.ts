import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DishEntity } from '../../dishes/entities/dish.entity.js';

@Entity('menu_categories')
export class MenuCategoryEntity {
  @ApiProperty({
    format: 'uuid',
    example: 'a507eeeb-4a88-4848-805a-87dd4a93ca26',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Супи' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ example: 'Перші страви', nullable: true, type: String })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: 1 })
  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @OneToMany(() => DishEntity, (dish) => dish.menuCategory)
  dishes: DishEntity[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
