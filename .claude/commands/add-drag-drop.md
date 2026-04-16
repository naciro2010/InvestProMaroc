# /add-drag-drop - Add Drag & Drop to a List

Add drag & drop reordering to an existing list/table page.

## Input

The user provides: page/component name.

## Steps

1. **Import** from `@/components/core/SortableTable`:
   ```tsx
   import {
     SortableTableRow, useSortableTable,
     DndContext, SortableContext,
     closestCenter, verticalListSortingStrategy
   } from '@/components/core/SortableTable'
   ```

2. **Add hook:**
   ```tsx
   const { items, sensors, handleDragEnd } = useSortableTable({
     initialItems: rawData,
     idKey: 'id',
     storageKey: '[entity]-order',  // localStorage persistence
   })
   ```

3. **Wrap table:**
   ```tsx
   <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
     <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
       <TableBody>
         {items.map(item => (
           <SortableTableRow key={item.id} id={item.id}>
             <TableCell>{item.name}</TableCell>
           </SortableTableRow>
         ))}
       </TableBody>
     </SortableContext>
   </DndContext>
   ```

4. **Add handle column** in TableHead: `<TableCell sx={{ width: 40 }} />`

5. **Verify:** drag handle visible, order persists on refresh
