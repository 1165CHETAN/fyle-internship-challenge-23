import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no requests are outstanding after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch repositories for a given GitHub username', () => {
    const githubUsername = 'exampleuser';
    const mockRepos = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }];

    service.getRepos(githubUsername).subscribe(repos => {
      expect(repos).toEqual(mockRepos);
    });

    const req = httpMock.expectOne(`https://api.github.com/users/${githubUsername}/repos?per_page=100`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRepos);
  });

  it('should handle errors when fetching repositories', () => {
    const githubUsername = 'exampleuser';

    service.getRepos(githubUsername).subscribe(
      () => fail('Expected error, but got success'),
      error => {
        expect(error).toBeTruthy();
      }
    );

    const req = httpMock.expectOne(`https://api.github.com/users/${githubUsername}/repos?per_page=100`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should cache repositories for a given GitHub username', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const githubUsername = 'exampleuser';
    const mockRepos = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }];

    service.getRepos(githubUsername).subscribe();
    service.getRepos(githubUsername).subscribe(repos => {
      expect(repos).toEqual(mockRepos);
    });

    const req = httpMock.expectOne(`https://api.github.com/users/${githubUsername}/repos?per_page=100`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRepos);
  }));

});
