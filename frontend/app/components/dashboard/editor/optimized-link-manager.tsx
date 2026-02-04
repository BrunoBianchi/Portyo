import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { BioBlock } from "~/contexts/bio.context";
import { OptimizedBlockCard } from "./optimized-block-card";
import { AddBlockModal } from "./add-block-modal";

interface OptimizedLinkManagerProps {
  blocks: BioBlock[];
  onUpdateBlocks: (blocks: BioBlock[]) => void;
  onEditBlock: (block: BioBlock) => void;
  onAddBlock: (type: BioBlock["type"]) => void;
}

// Memoized sortable item
const SortableItem = React.memo(function SortableItem({
  block,
  onEdit,
  onDelete,
}: {
  block: BioBlock;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <OptimizedBlockCard
        block={block}
        onEdit={onEdit}
        onDelete={onDelete}
        dragListeners={listeners}
      />
    </div>
  );
});

// Main component
export const OptimizedLinkManager = React.memo(function LinkManager({
  blocks,
  onUpdateBlocks,
  onEditBlock,
  onAddBlock,
}: OptimizedLinkManagerProps) {
  const { t } = useTranslation("dashboard");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize block IDs for SortableContext
  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  // Find active block for DragOverlay
  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeId),
    [blocks, activeId]
  );

  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        onUpdateBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    },
    [blocks, onUpdateBlocks]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm(t("editor.confirmDelete"))) {
        onUpdateBlocks(blocks.filter((b) => b.id !== id));
      }
    },
    [blocks, onUpdateBlocks, t]
  );

  const handleAddBlock = useCallback(
    (type: BioBlock["type"]) => {
      onAddBlock(type);
      setIsAddModalOpen(false);
    },
    [onAddBlock]
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-16 sm:pb-20">
      {/* Add Button */}
      <motion.button
        onClick={() => setIsAddModalOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 sm:py-4 bg-[#8129D9] hover:bg-[#7221C4] text-white rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        {t("editor.addLink")}
      </motion.button>

      <AddBlockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBlock}
      />

      {/* Blocks List */}
      <div className="space-y-3 sm:space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={blockIds}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableItem
                key={block.id}
                block={block}
                onEdit={() => onEditBlock(block)}
                onDelete={() => handleDelete(block.id)}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeBlock ? (
              <div className="opacity-90 scale-105 cursor-grabbing">
                <OptimizedBlockCard
                  block={activeBlock}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {blocks.length === 0 && (
          <div className="text-center py-12 sm:py-16 border-2 border-dashed border-black/10 rounded-[20px] sm:rounded-[24px] bg-white">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F3F3F1] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-black/40" />
            </div>
            <p className="text-black/40 font-bold text-base sm:text-lg">
              {t("dashboard.editor.empty.body")}
            </p>
            <p className="text-black/30 font-medium text-xs sm:text-sm mt-1">
              Toque no botão roxo para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
