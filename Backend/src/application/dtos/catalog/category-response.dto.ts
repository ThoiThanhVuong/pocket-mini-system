export class CategoryResponseDto {
    id: string;
    name: string;
    description: string;
    image: string;
    level: number;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
