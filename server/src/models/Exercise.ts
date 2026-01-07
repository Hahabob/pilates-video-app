import mongoose, { Document, Schema } from "mongoose";

export interface IExercise extends Document {
  Name: string;
  Page?: string;
  Machine_setup?: string;
  Exercise_move?: string;
  Function_target_muscles?: string;
  Muscle_group?: string;
  Cues?: string;
  Modifications?: string;
  Contraindications?: string;
  Peel_backs?: string;
  Repetitions?: string;
  Level?: string;
  Image_URL?: string;
  Video_URL?: string;
  Machine_type?: string;
  Series?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    Name: {
      type: String,
      required: true,
    },
    Page: {
      type: String,
    },
    Machine_setup: {
      type: String,
    },
    Exercise_move: {
      type: String,
    },
    Function_target_muscles: {
      type: String,
    },
    Muscle_group: {
      type: String,
    },
    Cues: {
      type: String,
    },
    Modifications: {
      type: String,
    },
    Contraindications: {
      type: String,
    },
    Peel_backs: {
      type: String,
    },
    Repetitions: {
      type: String,
    },
    Level: {
      type: String,
    },
    Image_URL: {
      type: String,
    },
    Video_URL: {
      type: String,
    },
    Machine_type: {
      type: String,
    },
    Series: {
      type: String,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Exercise = mongoose.model<IExercise>("Exercise", ExerciseSchema);
