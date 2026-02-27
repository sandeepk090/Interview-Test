import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo';
import { Todo } from '../../models/todo.model';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css'],
  imports: [CommonModule, FormsModule]
})
export class TodoList implements OnInit {

  todos$!: Observable<Todo[]>;
  selectedTodo: Todo | null = null;

  fromDate: string = '';
  toDate: string = '';

  private sortSubject = new BehaviorSubject<'title' | 'creationDate'>('title');
  private filterSubject = new BehaviorSubject<{ from: string, to: string }>({ from: '', to: '' });

  currentSortField: 'title' | 'creationDate' = 'title';
  isAscending: boolean = true;

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {

    this.todoService.loadTodos();

    this.todos$ = combineLatest([
      this.todoService.todos$,
      this.sortSubject,
      this.filterSubject
    ]).pipe(
      map(([todos, sortField, filter]) => {

        let filtered = todos.filter(t => {
          const date = new Date(t.creationDate).getTime();
          const from = filter.from ? new Date(filter.from).getTime() : 0;
          const to = filter.to ? new Date(filter.to).getTime() : Infinity;
          return date >= from && date <= to;
        });

        return [...filtered].sort((a, b) => {

          let result = 0;

          if (sortField === 'title') {
            result = a.title.localeCompare(b.title);
          } else {
            result = new Date(a.creationDate).getTime() -
                     new Date(b.creationDate).getTime();
          }

          return this.isAscending ? result : -result;

        });

      })
    );
  }

  sort(field: 'title' | 'creationDate') {

    if (this.currentSortField === field) {
      this.isAscending = !this.isAscending;
    } else {
      this.currentSortField = field;
      this.isAscending = true;
    }

    this.sortSubject.next(field);
  }

  toggleComplete(todo: Todo, value: boolean) {

    const updatedTodo: Todo = {
      ...todo,
      completed: value
    };

    this.todoService.updateTodo(updatedTodo);
    this.openSidebar(updatedTodo); // popup open
  }

  openSidebar(todo: Todo) {
    this.selectedTodo = { ...todo };
  }

  closeSidebar() {
    this.selectedTodo = null;
  }

  save() {
    if (this.selectedTodo) {

      const updatedTodo: Todo = {
        ...this.selectedTodo,
        title: this.selectedTodo.description
      };

      this.todoService.updateTodo(updatedTodo);
      this.closeSidebar();
    }
  }

  delete(id: number) {
    this.todoService.deleteTodo(id);
  }

  applyFilter() {
    this.filterSubject.next({
      from: this.fromDate,
      to: this.toDate
    });
  }

  resetFilter() {
    this.fromDate = '';
    this.toDate = '';
    this.filterSubject.next({ from: '', to: '' });
  }

  trackById(index: number, item: Todo) {
    return item.id;
  }
}