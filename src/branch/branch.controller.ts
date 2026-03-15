import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Controller('branch')
export class BranchController {

  constructor(
    private readonly branchService: BranchService,
    
  ) { }

  // CREATE BRANCH
  @Post()
  createBranch(@Body() body: CreateBranchDto) {
    return this.branchService.createBranch(body);
  }

  // GET ALL BRANCHES
  @Get()
  getBranches() {
    return this.branchService.findAllBranches();
  }

  // GET BRANCH BY ID
  @Get(':id')
  getBranch(@Param('id') id: string) {
    return this.branchService.findBranchById(id);
  }

}