import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {

  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable();

  private storageKey = 'todos_data';

  constructor(private http: HttpClient) {}

  loadTodos() {

    const saved = localStorage.getItem(this.storageKey);

    if (saved) {
      this.todosSubject.next(JSON.parse(saved));
      return;
    }

    this.http.get<any[]>('https://jsonplaceholder.typicode.com/todos?_limit=20')
      .pipe(
        map(items => items.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed,
          description: item.title,
          creationDate: this.randomDate()
        })))
      )
      .subscribe(data => {
        this.todosSubject.next(data);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      });
  }

  private randomDate(): Date {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 6, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  updateTodo(updated: Todo) {

    const todos = this.todosSubject.value.map(t =>
      t.id === updated.id ? updated : t
    );

    this.todosSubject.next(todos);

    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }

  deleteTodo(id: number) {

    const todos = this.todosSubject.value.filter(t => t.id !== id);

    this.todosSubject.next(todos);

    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }
}