import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private githubToken = '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'; // Replace with your personal access token
  private cachedRepos: { [username: string]: Observable<any[]> } = {};

  constructor(private httpClient: HttpClient) {}

  getRepos(githubUsername: string): Observable<any[]> {
    if (this.cachedRepos[githubUsername]) {
      return this.cachedRepos[githubUsername];
    }

    let headers = new HttpHeaders();
    if (this.githubToken) {
      headers = headers.append('Authorization', `token ${this.githubToken}`);
    }

    const params = new HttpParams().set('per_page', '100'); // Adjusted to fetch 100 repos per page

    const repos$ = this.httpClient.get<any[]>(`https://api.github.com/users/${githubUsername}/repos`, { headers, params }).pipe(
      catchError(error => {
        console.error('Error fetching repositories:', error);
        return throwError(error);
      }),
      shareReplay(1) // Cache the response and share it among subscribers
    );

    this.cachedRepos[githubUsername] = repos$;
    return repos$;
  }
}
