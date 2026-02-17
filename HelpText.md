# How to Play Pair & Place

## Goal

Complete the Sudoku by removing tile pairs and placing earned tokens.

## Step 1: Remove Pair

- Tap/click two tiles with the same number.
- Both tiles must be **open**:
  - no tile directly above
  - at least one horizontal side free

Removing a legal pair gives **2 tokens** of that number.

## Step 2: Use the Token Buffer

- Tokens go to the **Token Buffer**.
- Buffer capacity is **5**.
- If buffer is full, place tokens before removing another pair.

## Step 3: Place Token

You can place a token only if:

- the target cell is empty
- the same number is not in that row
- the same number is not in that column
- the same number is not in that 3x3 box

Select a token to highlight legal cells.

## Stuck, Lives, and Undos

- You are stuck when:
  - no removable pairs exist,
  - buffer is full,
  - and no legal placements exist for any token in buffer.
- You have **3 undos** per level.
- If stuck with no undos left, you lose 1 life.
- You have **3 lives** per level.

## Win Condition

You win when all tiles are removed, all tokens are placed, and the Sudoku is complete and valid.
