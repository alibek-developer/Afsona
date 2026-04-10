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
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner, index) => (
                  <Draggable key={banner.id} draggableId={banner.id} index={index}>
                    {(provided, snapshot) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging ? 'bg-blue-50 shadow-md ring-1 ring-blue-200' : 'hover:bg-gray-50/80 transition-colors'
                        }`}
                      >
                        <TableCell>
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {banner.image_url ? (
                            <div className="relative w-20 h-12 rounded-md overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                              <Image
                                src={banner.image_url}
                                alt={banner.image_alt_text || banner.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 rounded-md bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                              <span className="text-[10px] text-gray-400">No Image</span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 line-clamp-1">{banner.title}</span>
                            <span className="text-xs text-gray-500 line-clamp-1">Pos: #{banner.position}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 capitalize">
                            {banner.link_type?.replace('_', ' ')}
                          </span>
                        </TableCell>

                        <TableCell>
                          <button
                            onClick={() => onToggleActive(banner)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                              banner.is_active
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </TableCell>

                        <TableCell className="text-sm text-gray-600">
                          {banner.start_date || banner.end_date ? (
                            <div className="flex flex-col text-[11px] leading-tight">
                              <span className="text-gray-400 uppercase text-[9px] font-bold">Range</span>
                              <span>{banner.start_date ? new Date(banner.start_date).toLocaleDateString() : 'Start'} - {banner.end_date ? new Date(banner.end_date).toLocaleDateString() : 'End'}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Always Active</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(banner)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Edit Banner"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(banner)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
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
