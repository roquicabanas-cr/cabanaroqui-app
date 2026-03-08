import { useLocalStorage } from './useLocalStorage';
import type { Note } from '@/components/Analysis';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'roqui-notes';

export function useNotes() {
  const [notes, setNotesState] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  const setNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
  };

  const addNote = (data: Omit<Note, 'id' | 'createdAt'>): Note => {
    const newNote: Note = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };

    setNotesState([newNote, ...notes]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>): Note | null => {
    let updated: Note | null = null;
    
    setNotesState(
      notes.map(note => {
        if (note.id === id) {
          updated = { ...note, ...updates };
          return updated;
        }
        return note;
      })
    );
    
    return updated;
  };

  const deleteNote = (id: string): boolean => {
    setNotesState(notes.filter(note => note.id !== id));
    return true;
  };

  const getNotesByCategory = (category: Note['category']): Note[] => {
    return notes.filter(note => note.category === category);
  };

  return {
    notes,
    setNotes,
    addNote,
    updateNote,
    deleteNote,
    getNotesByCategory,
  };
}
