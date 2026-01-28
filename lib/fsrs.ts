import { fsrs, generatorParameters, Rating, Card, State, createEmptyCard } from 'ts-fsrs';
import { FSRSState } from './models/File';

// Initialize FSRS with default parameters
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

/**
 * Initialize FSRS state for a new file
 */
export function initializeFSRS(): FSRSState {
  const card = createEmptyCard();
  
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    due: card.due,
    state: 'new' as const,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
  };
}

/**
 * Convert our FSRSState to ts-fsrs Card format
 */
function toCard(state: FSRSState): Card {
  return {
    ...createEmptyCard(),
    stability: state.stability,
    difficulty: state.difficulty,
    due: state.due,
    state: stateToCardState(state.state),
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    last_review: state.due,
  };
}

/**
 * Convert ts-fsrs Card to our FSRSState format
 */
function fromCard(card: Card): FSRSState {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    due: card.due,
    state: cardStateToState(card.state),
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
  };
}

/**
 * Convert our state string to ts-fsrs State enum
 */
function stateToCardState(state: 'new' | 'learning' | 'review' | 'relearning'): State {
  const stateMap = {
    'new': State.New,
    'learning': State.Learning,
    'review': State.Review,
    'relearning': State.Relearning,
  };
  return stateMap[state];
}

/**
 * Convert ts-fsrs State enum to our state string
 */
function cardStateToState(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  const stateMap = {
    [State.New]: 'new' as const,
    [State.Learning]: 'learning' as const,
    [State.Review]: 'review' as const,
    [State.Relearning]: 'relearning' as const,
  };
  return stateMap[state];
}

/**
 * Convert rating (1-4) to FSRS Rating
 */
function toFSRSRating(rating: 1 | 2 | 3 | 4): Rating {
  const ratingMap = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  };
  return ratingMap[rating];
}

/**
 * Review a file and calculate new FSRS state
 * @param currentState Current FSRS state
 * @param rating User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @param reviewDate Date of review (default: now)
 * @returns New FSRS state after review
 */
export function reviewFile(
  currentState: FSRSState,
  rating: 1 | 2 | 3 | 4,
  reviewDate: Date = new Date()
): FSRSState {
  const card = toCard(currentState);
  const fsrsRating = toFSRSRating(rating);
  
  // Schedule the next review
  const scheduling_cards = f.repeat(card, reviewDate);
  
  // Get the appropriate card based on rating
  // scheduling_cards returns { [Rating]: { card: Card, log: ReviewLog } }
  // Use type assertion since we know fsrsRating is a Grade (not Manual)
  const recordLogItem = scheduling_cards[fsrsRating as Rating.Again | Rating.Hard | Rating.Good | Rating.Easy];
  
  return fromCard(recordLogItem.card);
}

/**
 * Check if a file is due for review today
 * @param fsrsState FSRS state to check
 * @param checkDate Date to check against (default: now)
 * @returns true if due today or overdue
 */
export function isDueToday(fsrsState: FSRSState, checkDate: Date = new Date()): boolean {
  const dueDate = new Date(fsrsState.due);
  const today = new Date(checkDate);
  
  // Set both to start of day for comparison
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return dueDate <= today;
}

/**
 * Check if a file is overdue
 * @param fsrsState FSRS state to check
 * @param checkDate Date to check against (default: now)
 * @returns true if overdue
 */
export function isOverdue(fsrsState: FSRSState, checkDate: Date = new Date()): boolean {
  const dueDate = new Date(fsrsState.due);
  const today = new Date(checkDate);
  
  // Set both to start of day for comparison
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

/**
 * Get days until next review
 * @param fsrsState FSRS state to check
 * @param checkDate Date to check from (default: now)
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDue(fsrsState: FSRSState, checkDate: Date = new Date()): number {
  const dueDate = new Date(fsrsState.due);
  const today = new Date(checkDate);
  
  // Set both to start of day for comparison
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get a human-readable status for a file's review state
 * @param fsrsState FSRS state
 * @returns Status string
 */
export function getReviewStatus(fsrsState: FSRSState): {
  status: 'new' | 'overdue' | 'due_today' | 'upcoming';
  daysUntilDue: number;
  message: string;
} {
  if (fsrsState.state === 'new') {
    return {
      status: 'new',
      daysUntilDue: 0,
      message: 'Chưa ôn tập lần nào',
    };
  }
  
  const days = getDaysUntilDue(fsrsState);
  
  if (days < 0) {
    return {
      status: 'overdue',
      daysUntilDue: days,
      message: `Quá hạn ${Math.abs(days)} ngày`,
    };
  }
  
  if (days === 0) {
    return {
      status: 'due_today',
      daysUntilDue: 0,
      message: 'Cần ôn hôm nay',
    };
  }
  
  return {
    status: 'upcoming',
    daysUntilDue: days,
    message: `Ôn sau ${days} ngày`,
  };
}

export { Rating as FSRSRating } from 'ts-fsrs';
