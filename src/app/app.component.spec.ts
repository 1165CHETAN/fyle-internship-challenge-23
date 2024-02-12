import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties', () => {
    expect(component.user).toBeUndefined();
    expect(component.userNotFound).toBeFalsy();
    expect(component.searchUsername).toEqual('');
    expect(component.repositories).toEqual([]);
    expect(component.isLoadingUser).toBeFalsy();
    expect(component.dataLoaded).toBeFalsy();
    expect(component.currentPage).toEqual(1);
    expect(component.pageSize).toEqual(10);
    expect(component.loadingRepositories).toBeFalsy();
    expect(component.pagedRepositories).toEqual([]);
  });

  it('should fetch user data and repositories on searchUser method call', fakeAsync(() => {
    const mockUser = { id: 1, login: 'exampleuser' };
    const mockRepos = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }];

    component.searchUser('exampleuser');

    const req = httpTestingController.expectOne('https://api.github.com/users/exampleuser');
    expect(req.request.method).toEqual('GET');
    req.flush(mockUser);

    const req2 = httpTestingController.expectOne('https://api.github.com/users/exampleuser/repos');
    expect(req2.request.method).toEqual('GET');
    req2.flush(mockRepos);

    tick();

    expect(component.user).toEqual(mockUser);
    expect(component.repositories).toEqual(mockRepos);
    expect(component.loadingRepositories).toBeFalsy();
  }));

  it('should handle error when fetching user data or repositories on searchUser method call', fakeAsync(() => {
    spyOn(console, 'error');

    component.searchUser('nonexistentuser');

    const req = httpTestingController.expectOne('https://api.github.com/users/nonexistentuser');
    expect(req.request.method).toEqual('GET');
    req.error(new ErrorEvent('Network error'));

    tick();

    expect(component.userNotFound).toBeTruthy();
    expect(component.isLoadingUser).toBeFalsy();
    expect(component.loadingRepositories).toBeFalsy();
    expect(console.error).toHaveBeenCalled();
  }));

  it('should paginate repositories correctly', () => {
    component.repositories = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    component.pageSize = 2;

    component.paginateRepositories();

    expect(component.pagedRepositories).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should calculate page numbers correctly', () => {
    component.repositories = [{}, {}, {}, {}, {}];
    component.pageSize = 2;

    const pageNumbers = component.getPageNumbers();

    expect(pageNumbers).toEqual([1, 2, 3]);
  });

  
  it('should navigate to the next page', () => {
    component.currentPage = 1;
    component.repositories = [{}, {}, {}, {}, {}];
    component.pageSize = 2;

    component.nextPage();

    expect(component.currentPage).toEqual(2);
  });

  it('should navigate to the previous page', () => {
    component.currentPage = 2;
    component.repositories = [{}, {}, {}, {}, {}];
    component.pageSize = 2;

    component.prevPage();

    expect(component.currentPage).toEqual(1);
  });



  it('should not navigate to the next page if already on the last page', () => {
    component.currentPage = 3;
    component.repositories = [{}, {}, {}, {}, {}];
    component.pageSize = 2;

    component.nextPage();

    expect(component.currentPage).toEqual(3);
  });

  it('should paginate repositories correctly', () => {
    // Test pagination functionality
    component.repositories = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    component.pageSize = 2;

    component.paginateRepositories();

    expect(component.pagedRepositories).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should update paged repositories when page size changes', () => {
    // Test updating paged repositories on page size change
    component.repositories = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    component.pageSize = 2;

    component.onPageSizeChange();

    expect(component.pagedRepositories).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should generate an array of the specified length', () => {
    // Test generating an array of the specified length
    const length = 5;
    const array = component.generateArray(length);

    expect(array.length).toEqual(length);
  });

  // Add more test cases as needed for pagination, page navigation, etc.
});

