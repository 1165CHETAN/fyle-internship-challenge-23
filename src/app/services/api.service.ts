import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private githubToken = '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'; // Replace with your personal access token

  constructor(private httpClient: HttpClient) {}

  getRepos(githubUsername: string): Observable<any[]> {
    let headers = new HttpHeaders();
    if (this.githubToken) {
      headers = headers.append('Authorization', `token ${this.githubToken}`);
    }    
    
    return this.httpClient.get<any[]>(`https://api.github.com/users/${githubUsername}/repos?per_page=100`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching repositories:', error);
        return throwError(error);
      }),
      mergeMap((repos: any[]) => {
        const observables: Observable<any>[] = repos.map(repo => {
          return this.httpClient.get<any>(repo.languages_url, { headers }).pipe(
            catchError(error => {
              console.error('Error fetching languages:', error);
              return throwError(error);
            })
          );
        });
        return forkJoin(observables).pipe(
          catchError(error => {
            console.error('Error fetching languages:', error);
            return throwError(error);
          }),
          mergeMap(languages => {
            return of(repos.map((repo, index) => ({ ...repo, languages: languages[index] })));
          })
        );
      })
    );
  }
}
