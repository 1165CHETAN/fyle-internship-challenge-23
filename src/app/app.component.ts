import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { HttpClient } from '@angular/common/http'; // Import HttpClient module

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
  skeletonArray: any[] = Array(10).fill(0);

  constructor(
    private apiService: ApiService,
    private http: HttpClient // Inject HttpClient module
  ) {}

  ngOnInit() {}

  searchUser(username: string) {
    this.isLoadingUser = true;
    this.userNotFound = false;
    this.repositories = [];

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
          },
          (error) => {
            console.error('Error fetching repositories:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching user:', error);
        this.userNotFound = true;
        this.isLoadingUser = false;
      }
    );
  }

  formatFollowersCount(count: number): string {
    if (count > 1000) {
      return (count / 1000).toFixed(1) + 'k';
    } else {
      return count.toString();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.repositories.length / this.pageSize);
    return Array(pageCount).fill(0).map((x, i) => i + 1);
  }

  goToPage(pageNumber: number) {
    this.currentPage = pageNumber;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    const pageCount = Math.ceil(this.repositories.length / this.pageSize);
    if (this.currentPage < pageCount) {
      this.currentPage++;
    }
  }
}
