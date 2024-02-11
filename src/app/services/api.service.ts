import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private githubToken = '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'; // Replace with your personal access token

  constructor(private httpClient: HttpClient) {}

  getUser(githubUsername: string): Observable<any> {
    return this.httpClient.get(`https://api.github.com/users/${githubUsername}`).pipe(
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  getRepos(githubUsername: string): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.githubToken}`
    });

    return this.httpClient.get<any[]>(`https://api.github.com/users/${githubUsername}/repos`, { headers }).pipe(
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
            }),
            map((languages: any) => {
              return { ...repo, languages };
            })
          );
        });
        return forkJoin(observables) as Observable<any[]>;
      })
    );
  }
}
