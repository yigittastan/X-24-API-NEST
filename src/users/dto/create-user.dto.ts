export class CreateUserDto {
  name: string;
  readonly lastname?: string;
  email: string;
  readonly phone?: string;
  password: string;
  role?: string;
  position?: string;
  department?: string;
  workType?: string;
  workLocation?: string;
  team?: string;
  gender?: string;
  profilePicture?: string;
  bio?: string;
  links?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  inviteCode?: string;
  companyName?: string;
  readonly provider?: string;
  readonly workspace?: string;
}
