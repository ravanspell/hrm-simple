import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeLeavesService } from './employee-leaves.service';

describe('EmployeeLeavesService', () => {
  let service: EmployeeLeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeLeavesService],
    }).compile();

    service = module.get<EmployeeLeavesService>(EmployeeLeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
