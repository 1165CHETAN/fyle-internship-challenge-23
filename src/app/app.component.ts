import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: any;
  userNotFound: boolean = false;
  searchUsername: string = '';
  repositories: any[] = [];
  Object = Object;
  isLoadingUser: boolean = false;
  dataLoaded: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  loadingRepositories: boolean = false;
  pagedRepositories: any[] = [];
  
  constructor(
    private http: HttpClient // Inject HttpClient module
  ) {}

  ngOnInit() {}

  searchUser(username: string) {
    this.isLoadingUser = true;
    this.userNotFound = false;
    this.repositories = [];
    this.loadingRepositories = true;
    
    // Fetch user data
    this.http.get<any>('https://api.github.com/users/' + username).subscribe(
      (user: any) => {
        this.user = user;
        this.isLoadingUser = false;
        this.dataLoaded = true;

        // Fetch repositories data
        this.http.get<any[]>('https://api.github.com/users/' + username + '/repos').subscribe(
          (repos: any[]) => {
            this.repositories = repos;
            this.loadingRepositories = false;
            this.paginateRepositories();
          },
          (error) => {
            console.error('Error fetching repositories:', error);
            this.loadingRepositories = false;
          }
        );
      },
      (error) => {
        console.error('Error fetching user:', error);
        this.userNotFound = true;
        this.isLoadingUser = false;
        this.loadingRepositories = false;
      }
    );
  }

  paginateRepositories() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedRepositories = this.repositories.slice(startIndex, startIndex + this.pageSize);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginateRepositories();
  }

  getPageNumbers() {
    const pageCount = Math.ceil(this.repositories.length / this.pageSize);
    return Array(pageCount).fill(0).map((x, i) => i + 1);
  }

  goToPage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.paginateRepositories();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateRepositories();
    }
  }
    // Method to generate an array of the specified length
    generateArray(length: number): any[] {
      return Array.from({ length });
    }
  

  nextPage() {
    const pageCount = Math.ceil(this.repositories.length / this.pageSize);
    if (this.currentPage < pageCount) {
      this.currentPage++;
      this.paginateRepositories();
    }
  }
}
