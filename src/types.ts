export type ScoreValue = {
  value: number;
  data?: unknown;
};

export type Team = {
  id: string;
  name?: string;
  country?: string;
  olimpoId?: string | number;
  stepId?: string | number;
  token?: string;
  city?: string;
  state?: string;
};

export type ScoreRow = {
  id: string;
  teamId?: string;
  team?: Team;
  scores?: Record<string, ScoreValue>;
  desafio1?: string;
  desafio2?: string;
  desafio3?: string;
};

export type TournamenterTable = {
  id: string;
  name: string;
  columns?: number | string;
  viewColumns?: number | string | null;
  headers?: {
    rank: string;
    team: string;
    scores: string[];
    final: string;
  };
  scores: ScoreRow[];
};

export type SyncConfig = {
  url?: string | null;
  sync: boolean | string;
  method?: string;
  interval: number | string;
};

export type BootData = {
  route?: string;
  newestVersion?: string | null;
};

declare global {
  interface Window {
    __TOURNAMENTER_OBR__?: BootData;
    INITIALIZER1?: string[];
    INITIALIZER2?: string[];
    Tokens?: {
      decode(value: string): string;
    };
    generateTimetable?: (config: unknown, table: TournamenterTable | null) => TimetableResult;
    markdownTable?: (rows: string[][]) => string;
    exportToCsv?: (rows: string[][]) => string;
  }
}

export type TimetableResult = {
  errors: string[];
  tables?: string[][][];
  finalRodadas?: Record<string, number>;
  finalRodadasErrors?: Record<string, boolean>;
};
