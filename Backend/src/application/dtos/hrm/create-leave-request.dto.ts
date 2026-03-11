import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LeaveType } from "../../../core/domain/enums/leave-type.enum";

export class CreateLeaveRequestDto {
    @IsEnum(LeaveType)
    @IsNotEmpty()
    leaveType: LeaveType;

    @IsDateString()
    @IsNotEmpty()
    startDate: Date;

    @IsDateString()
    @IsNotEmpty()
    endDate: Date;

    @IsString()
    @IsNotEmpty()
    reason: string;
}
