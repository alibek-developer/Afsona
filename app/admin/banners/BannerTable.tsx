'use client';

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Website_Banner } from '@/lib/banner'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { Edit2, GripVertical, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface BannerTableProps {
  banners: Website_Banner[];
  onEdit: (banner: Website_Banner) => void;
  onDelete: (banner: Website_Banner) => void;
  onToggleActive: (banner: Website_Banner) => void;
  onReorder: (newOrder: Website_Banner[]) => void;
}

export default function BannerTable({
  banners,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
}: BannerTableProps) {
  const [enabled, setEnabled] = useState(false);

  // Workaround for react-beautiful-dnd with React 18+ and StrictMode
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    onReorder(updatedItems);
  };

  if (!enabled) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="banners">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Table className="border-none bg-transparent dark:bg-transparent shadow-none">
              <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <TableRow className="border-b border-gray-100 dark:border-zinc-800 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[100px] text-gray-600 dark:text-zinc-400 font-bold">Image</TableHead>
                  <TableHead className="text-gray-600 dark:text-zinc-400 font-bold">Title</TableHead>
                  <TableHead className="text-gray-600 dark:text-zinc-400 font-bold">Link Type</TableHead>
                  <TableHead className="text-gray-600 dark:text-zinc-400 font-bold">Status</TableHead>
                  <TableHead className="text-gray-600 dark:text-zinc-400 font-bold">Date Range</TableHead>
                  <TableHead className="w-[120px] text-right text-gray-600 dark:text-zinc-400 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner, index) => (
                  <Draggable key={banner.id} draggableId={banner.id} index={index}>
                    {(provided, snapshot) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border-b border-gray-100 dark:border-zinc-800 transition-colors ${
                          snapshot.isDragging
                            ? 'bg-blue-50/50 dark:bg-blue-950/40 shadow-lg ring-1 ring-blue-200 dark:ring-blue-900/50'
                            : 'hover:bg-gray-50/80 dark:hover:bg-zinc-900/40'
                        }`}
                      >
                        <TableCell>
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {banner.image_url ? (
                            <div className="relative w-20 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700">
                              <Image
                                src={banner.image_url}
                                alt={banner.image_alt_text || banner.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-zinc-700">
                              <span className="text-[10px] text-gray-400 dark:text-zinc-500">No Image</span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-1">{banner.title}</span>
                            <span className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">Pos: #{banner.position}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 capitalize">
                            {banner.link_type?.replace('_', ' ')}
                          </span>
                        </TableCell>

                        <TableCell>
                          <button
                            onClick={() => onToggleActive(banner)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                              banner.is_active
                                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/30'
                                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'}`} />
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </TableCell>

                        <TableCell className="text-sm text-gray-600 dark:text-zinc-300">
                          {banner.start_date || banner.end_date ? (
                            <div className="flex flex-col text-[11px] leading-tight">
                              <span className="text-gray-400 dark:text-zinc-500 uppercase text-[9px] font-bold">Range</span>
                              <span>{banner.start_date ? new Date(banner.start_date).toLocaleDateString() : 'Start'} - {banner.end_date ? new Date(banner.end_date).toLocaleDateString() : 'End'}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-zinc-500 italic text-xs">Always Active</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(banner)}
                              className="h-8 w-8 p-0 text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              title="Edit Banner"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(banner)}
                              className="h-8 w-8 p-0 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            </Table>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
