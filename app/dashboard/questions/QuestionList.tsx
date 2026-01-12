'use client';

import React, { useState } from 'react';
import { Question, NewQuestion, createQuestion, updateQuestion, deleteQuestion, updateQuestionOrder } from './actions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DragHandleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-foreground/50">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

// Helper component for sortable items
function SortableItem({ id, children }: { id: string; children: (listeners: any, attributes: any) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 0 15px rgba(0,0,0,0.1)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
    </div>
  );
}

export default function QuestionList({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [optionsInput, setOptionsInput] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<NewQuestion>({
    question_text: '',
    question_type: 'text',
    options: null,
    sort_order: 0,
    is_required: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'text',
      options: null,
      sort_order: questions.length + 1,
      is_required: true,
    });
    setOptionsInput('');
    setIsEditing(null);
    setIsCreating(false);
  };

  const handleSubmit = async () => {
    const finalFormData = {
      ...formData,
      options: (formData.question_type === 'multiple_choice' || formData.question_type === 'checkbox') 
        ? optionsInput.split(',').map(s => s.trim()).filter(s => s)
        : null,
    };

    if (isCreating) {
      try {
        const newQ = await createQuestion(finalFormData);
        setQuestions([...questions, newQ].sort((a, b) => a.sort_order - b.sort_order));
        resetForm();
      } catch (e) {
        alert('Failed to create question');
      }
    } else if (isEditing) {
      try {
        const updatedQ = await updateQuestion(isEditing, finalFormData);
        setQuestions(questions.map(q => q.id === isEditing ? updatedQ : q).sort((a, b) => a.sort_order - b.sort_order));
        resetForm();
      } catch (e) {
        alert('Failed to update question');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (e) {
      alert('Failed to delete question');
    }
  };

  const startEdit = (q: Question) => {
    setFormData({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      sort_order: q.sort_order,
      is_required: q.is_required,
    });
    setOptionsInput(q.options ? q.options.join(', ') : '');
    setIsEditing(q.id);
    setIsCreating(false);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldItems = [...questions];
      const oldIndex = oldItems.findIndex(item => item.id === active.id);
      const newIndex = oldItems.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(oldItems, oldIndex, newIndex);
      const updatedOrderForState = newItems.map((item, index) => ({ ...item, sort_order: index }));

      // Optimistically update the UI
      setQuestions(updatedOrderForState);

      // Prepare data for the server and call the action
      const updatedOrderForServer = updatedOrderForState.map(({ id, sort_order }) => ({ id, sort_order }));
      
      updateQuestionOrder(updatedOrderForServer).catch(err => {
        console.error("Failed to update question order:", err);
        alert("Failed to save the new order. The page will revert to the last saved order.");
        // Revert to the old state on failure
        setQuestions(oldItems);
      });
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Application Questions</h2>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Add Question
        </button>
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-medium mb-4">{isCreating ? 'New Question' : 'Edit Question'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <input
                type="text"
                value={formData.question_text}
                onChange={e => setFormData({ ...formData, question_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.question_type}
                  onChange={e => setFormData({ ...formData, question_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="text">Short Text</option>
                  <option value="long_text">Long Text</option>
                  <option value="number">Number</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="url">URL</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>

            {(formData.question_type === 'multiple_choice' || formData.question_type === 'checkbox') && (
              <div>
                <label className="block text-sm font-medium mb-1">Options (comma separated)</label>
                <input
                  type="text"
                  value={optionsInput}
                  onChange={e => setOptionsInput(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={e => setFormData({ ...formData, is_required: e.target.checked })}
                id="is_required"
              />
              <label htmlFor="is_required" className="text-sm">Required</label>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                {isCreating ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map(q => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((q) => (
              <SortableItem key={q.id} id={q.id}>
                {(listeners, attributes) => (
                  <div className="bg-card p-4 rounded-lg shadow border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="cursor-grab" {...attributes} {...listeners}><DragHandleIcon /></span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{q.question_text}</span>
                          {q.is_required && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Required</span>}
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded uppercase">{q.question_type.replace('_', ' ')}</span>
                        </div>
                        {q.options && (
                          <div className="text-sm text-foreground/60">
                            Options: {q.options.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div>
        {questions.length === 0 && !isCreating && (
          <div className="text-center py-8 text-foreground/60">
            No questions found. Click "Add Question" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
