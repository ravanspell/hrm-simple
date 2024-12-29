import { Repository, EntityTarget } from 'typeorm';
import AppDataSource from '../config/datasource';

export class BaseRepository<T> extends Repository<T> {
  constructor(private readonly entity: EntityTarget<T>) {

    const entityManager = AppDataSource.createEntityManager();
    super(entity, entityManager);
  }

  async findAll(): Promise<T[]> {
    return this.find();
  }

//   async findById(id: any): Promise<T | null> {
//     return this.findOne({ where: { id } });
//   }

  async createAndSave(entity: Partial<T>): Promise<T> {
    return this.save(entity as T);
  }

  async deleteById(id: number): Promise<void> {
    await this.delete(id);
  }
}
