import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type Node = { text: string; state: 'red' | 'yellow' | 'green' };
type List = { id: number; name: string; nodes: Node[] };

// Custom hook for state management
function useMultiList() {
  const [lists, setLists] = useState<List[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lists-multilist');
      if (stored) {
        try {
          return JSON.parse(stored) as List[];
        } catch {}
      }
    }
    return [
      {
        id: 1,
        name: 'My List',
        nodes: [
          { text: 'Item 1', state: 'red' },
          { text: 'Item 2', state: 'red' },
          { text: 'Item 3', state: 'red' }
        ]
      }
    ];
  });
  const [selectedListId, setSelectedListId] = useState<number>(() => lists[0]?.id ?? 1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lists-multilist', JSON.stringify(lists));
    }
  }, [lists]);

  const selectedList = lists.find(l => l.id === selectedListId) ?? lists[0];

  const setNodes = (updater: Node[] | ((prev: Node[]) => Node[])) => {
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === selectedList.id
          ? { ...list, nodes: typeof updater === 'function' ? updater(list.nodes) : updater }
          : list
      )
    );
  };

  // List name
  const [listName, setListName] = useState(selectedList.name);
  useEffect(() => {
    setListName(selectedList.name);
  }, [selectedListId, selectedList.name]);

  const handleListNameChange = (v: string) => {
    setListName(v);
    setLists(prev =>
      prev.map(list =>
        list.id === selectedList.id ? { ...list, name: v } : list
      )
    );
  };

  // Add new list
  const handleCreateList = () => {
    const newId = Date.now();
    setLists(prev => [
      ...prev,
      { id: newId, name: 'new list', nodes: [] }
    ]);
    setSelectedListId(newId);
    setTimeout(() => {
      const input = document.getElementById('list-name-input');
      if (input) (input as HTMLInputElement).focus();
    }, 0);
  };

  // Delete list
  const handleDeleteList = () => {
    if (lists.length === 1) {
      window.alert("You must have at least one list.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedList.name}"? This cannot be undone.`
    );
    if (confirmed) {
      setLists(prev => {
        const filtered = prev.filter(list => list.id !== selectedList.id);
        if (filtered.length > 0) {
          setSelectedListId(filtered[0].id);
        }
        return filtered;
      });
    }
  };

  return {
    lists,
    setLists,
    selectedList,
    selectedListId,
    setSelectedListId,
    nodes: selectedList.nodes,
    setNodes,
    listName,
    setListName,
    handleListNameChange,
    handleCreateList,
    handleDeleteList,
  };
}

// Top section: title and dropdown
function TopSection(props: {
  lists: List[];
  selectedListId: number;
  setSelectedListId: (id: number) => void;
  listName: string;
  setListName: (v: string) => void;
  handleListNameChange: (v: string) => void;
  handleCreateList: () => void;
  handleDeleteList: () => void;
}) {
  const {
    lists, selectedListId, setSelectedListId,
    listName, setListName, handleListNameChange,
    handleCreateList, handleDeleteList
  } = props;
  const [dropdownHovered, setDropdownHovered] = useState(false);

  return (
    <div
      className="relative flex items-center mb-4 group"
      onMouseEnter={() => setDropdownHovered(true)}
      onMouseLeave={() => setDropdownHovered(false)}
    >
      <Input
        id="list-name-input"
        className="font-lora w-full text-xl px-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        value={listName}
        onChange={e => setListName(e.target.value)}
        onBlur={e => handleListNameChange(e.target.value)}
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 500,
        }}
        autoComplete="off"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            tabIndex={-1}
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {lists.map(list => (
            <DropdownMenuItem
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              className={selectedListId === list.id ? 'font-bold' : ''}
            >
              {list.name || <span className="italic text-muted-foreground">Untitled</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={handleCreateList}>
            + create new list
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteList}
            className="text-red-500"
          >
            delete current list
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Middle section: segmented bar chart
function MiddleSection(props: { nodes: Node[] }) {
  const { nodes } = props;
  const total = nodes.length || 1;
  const redCount = nodes.filter(n => n.state === 'red').length;
  const yellowCount = nodes.filter(n => n.state === 'yellow').length;
  const greenCount = nodes.filter(n => n.state === 'green').length;
  const redPct = (redCount / total) * 100;
  const yellowPct = (yellowCount / total) * 100;
  const greenPct = (greenCount / total) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex h-12 w-full rounded-xl overflow-hidden">
        <div
          className="transition-all duration-300"
          style={{
            width: `${redPct}%`,
            backgroundColor: redCount > 0 ? '#ef4444' : 'transparent',
            transition: 'width 0.3s'
          }}
        />
        <div
          className="transition-all duration-300"
          style={{
            width: `${yellowPct}%`,
            backgroundColor: yellowCount > 0 ? '#fde047' : 'transparent',
            transition: 'width 0.3s'
          }}
        />
        <div
          className="transition-all duration-300"
          style={{
            width: `${greenPct}%`,
            backgroundColor: greenCount > 0 ? '#4ade80' : 'transparent',
            transition: 'width 0.3s'
          }}
        />
      </div>
    </div>
  );
}

// Bottom section: list of nodes
function BottomSection(props: {
  nodes: Node[];
  setNodes: (updater: Node[] | ((prev: Node[]) => Node[])) => void;
}) {
  const { nodes, setNodes } = props;
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // Add item
  const addItem = useCallback(() => {
    setNodes((prev: Node[]) => [...prev, { text: "", state: 'red' }]);
    setTimeout(() => {
      textareaRefs.current[nodes.length]?.focus();
    }, 0);
  }, [nodes.length, setNodes]);

  // Cmd+Enter to add item
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        addItem();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addItem]);

  // Autosize textareas
  useEffect(() => {
    textareaRefs.current.forEach((textarea) => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    });
  }, [nodes]);

  // Animation order
  const getOrder = (state: 'red' | 'yellow' | 'green') =>
    state === 'red' ? 0 : state === 'yellow' ? 1 : 2;
  const sortedNodes = [...nodes].sort((a, b) => getOrder(a.state) - getOrder(b.state));

  return (
    <motion.ul layout className="space-y-2">
      <AnimatePresence>
        {sortedNodes.map((node, sortedIdx) => {
          const index = nodes.findIndex((n) => n === node);
          return (
            <motion.li
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center"
            >
              <button
                type="button"
                aria-label="Change state"
                className={`mr-3 rounded-full w-2 h-2 my-auto flex-shrink-0 transition-all duration-300 hover:blur-[2px]
                  ${node.state === 'red' ? 'bg-red-500' : node.state === 'yellow' ? 'bg-yellow-300' : 'bg-green-400'}
                `}
                style={{ fontSize: 28, minWidth: 28, minHeight: 28 }}
                onClick={() => {
                  setNodes(prev => {
                    const updated: Node[] = prev.map((n, i) =>
                      i === index
                        ? {
                            ...n,
                            state:
                              n.state === 'red'
                                ? 'yellow'
                                : n.state === 'yellow'
                                ? 'green'
                                : 'red'
                          }
                        : n
                    );
                    return updated;
                  });
                }}
              />
              <div
                className="flex items-center w-full group"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ width: '100%' }}
              >
                <Textarea
                  id={`item-${index}`}
                  value={node.text}
                  onChange={e => {
                    const newNodes = [...nodes];
                    newNodes[index] = { ...newNodes[index], text: e.target.value };
                    setNodes(newNodes);
                  }}
                  className="focus:outline-none focus:ring-none"
                  rows={1}
                  style={{ resize: 'none', overflowY: 'hidden' }}
                  ref={el => (textareaRefs.current[index] = el)}
                  onInput={e => {
                    const textarea = e.currentTarget;
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                  }}
                  onFocus={() => setFocusedIdx(index)}
                  onBlur={e => {
                    setFocusedIdx(null);
                    const trimmed = e.currentTarget.value.trim();
                    if (trimmed === "") {
                      setNodes(prev => prev.filter((_, i) => i !== index));
                    } else if (trimmed !== nodes[index].text) {
                      const newNodes = [...nodes];
                      newNodes[index] = { ...newNodes[index], text: trimmed };
                      setNodes(newNodes);
                    }
                  }}
                  onKeyDown={e => {
                    const textarea = e.currentTarget;
                    if (
                      e.key === 'Backspace' &&
                      textarea.value === ''
                    ) {
                      e.preventDefault();
                      setNodes(prev => prev.filter((_, i) => i !== index));
                      setTimeout(() => {
                        if (index > 0) {
                          textareaRefs.current[index - 1]?.focus();
                        } else if (nodes.length > 1) {
                          textareaRefs.current[1]?.focus();
                        }
                      }, 0);
                      return;
                    }
                    if (
                      e.key === 'ArrowUp' &&
                      textarea.selectionStart === 0 &&
                      textarea.selectionEnd === 0 &&
                      index > 0
                    ) {
                      e.preventDefault();
                      textareaRefs.current[index - 1]?.focus();
                    }
                    if (
                      e.key === 'ArrowDown' &&
                      textarea.selectionStart === textarea.value.length &&
                      textarea.selectionEnd === textarea.value.length &&
                      index < nodes.length - 1
                    ) {
                      const value = textarea.value;
                      const beforeCaret = value.slice(0, textarea.selectionStart);
                      if (
                        beforeCaret.split('\n').length === value.split('\n').length
                      ) {
                        e.preventDefault();
                        textareaRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                />
                {((focusedIdx === null && hoveredIdx === index) || focusedIdx === index) && (
                  <button
                    type="button"
                    aria-label="Delete"
                    className="ml-auto text-red-500 text-lg font-mono cursor-pointer"
                    tabIndex={-1}
                    onClick={() => setNodes(prev => prev.filter((_, i) => i !== index))}
                  >
                    X
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}

// Main App
export default function App() {
  const {
    lists, setLists, selectedList, selectedListId, setSelectedListId,
    nodes, setNodes, listName, setListName,
    handleListNameChange, handleCreateList, handleDeleteList
  } = useMultiList();

  return (
    <main className="container mx-auto py-10 lg:px-52">
      <TopSection
        lists={lists}
        selectedListId={selectedListId}
        setSelectedListId={setSelectedListId}
        listName={listName}
        setListName={setListName}
        handleListNameChange={handleListNameChange}
        handleCreateList={handleCreateList}
        handleDeleteList={handleDeleteList}
      />
      <MiddleSection nodes={nodes} />
      <BottomSection nodes={nodes} setNodes={setNodes} />
    </main>
  );
}
