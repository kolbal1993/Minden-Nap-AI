import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Image as ImageIcon, 
  Send, 
  Plus, 
  Search, 
  Filter,
  User,
  HelpCircle,
  CheckCircle2,
  Rocket,
  X,
  Camera,
  File,
  Paperclip,
  Reply,
  ExternalLink,
  Download,
  MoreVertical,
  Smile
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reactions from '../components/Reactions';
import EmojiPickerButton from '../components/EmojiPickerButton';
import { addNotification } from '../utils/notifications';

interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64
}

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  date: string;
  attachments?: Attachment[];
  replies?: Comment[];
  reactions?: { [emoji: string]: number };
  userReaction?: string;
}

interface Post {
  id: string;
  author: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: 'experience' | 'project' | 'help';
  reactions: { [emoji: string]: number };
  comments: Comment[];
  date: string;
  attachments?: Attachment[];
  userReaction?: string;
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Kovács János',
    authorAvatar: 'https://picsum.photos/seed/user1/200/200',
    title: 'Első saját AI chatbotom',
    content: 'Sikerült befejeznem az első saját chatbotomat, ami a cégünk belső dokumentációjában segít keresni. OpenAI API-t és Pinecone-t használtam a RAG architektúrához. Nagyon izgalmas projekt volt!',
    category: 'project',
    reactions: { '👍': 15, '🔥': 9 },
    attachments: [
      { id: 'a1', name: 'ai-chat.jpg', type: 'image/jpeg', data: 'https://picsum.photos/seed/ai-chat/800/400' }
    ],
    comments: [
      { 
        id: 'c1', 
        author: 'Szabó Anna', 
        authorAvatar: 'https://picsum.photos/seed/user2/200/200',
        text: 'Gratulálok! Milyen embedding modellt használtál?', 
        date: '2026-04-03',
        replies: [
          {
            id: 'r1',
            author: 'Kovács János',
            authorAvatar: 'https://picsum.photos/seed/user1/200/200',
            text: 'Köszönöm! text-embedding-3-small modellt használtam.',
            date: '2026-04-03'
          }
        ]
      }
    ],
    date: '2026-04-03'
  },
  {
    id: '2',
    author: 'Nagy Péter',
    authorAvatar: 'https://picsum.photos/seed/user3/200/200',
    title: 'Segítségre lenne szükségem Stable Diffusion-nel',
    content: 'Próbálok egy egyedi LoRA-t tanítani a saját rajzstílusomra, de valahogy mindig túlilleszkedik a modell. Valakinek van tapasztalata a Kohya_ss beállításaival?',
    category: 'help',
    reactions: { '😮': 8, '😢': 4 },
    comments: [],
    date: '2026-04-04'
  },
  {
    id: '3',
    author: 'Kiss Eszter',
    authorAvatar: 'https://picsum.photos/seed/user4/200/200',
    title: 'Tapasztalatok a Claude 3.5 Sonnet-tel',
    content: 'Az elmúlt héten teljesen átálltam a Claude használatára kódoláshoz. Hihetetlenül pontos, főleg a React komponensek refaktorálásában. Ti mit gondoltok?',
    category: 'experience',
    reactions: { '❤️': 30, '👍': 15 },
    comments: [],
    date: '2026-04-02'
  }
];

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (id: string, author: string) => void;
  onReact: (commentId: string, emoji: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  postId, 
  onReply, 
  onReact, 
  depth = 0 
}) => {
  return (
    <div className={`space-y-4 ${depth > 0 ? 'ml-6 pl-4 border-l border-white/5' : ''}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
          {comment.authorAvatar ? (
            <img src={comment.authorAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-400">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h5 className="font-bold text-sm text-gray-200">{comment.author}</h5>
            <span className="text-[10px] text-gray-500">{comment.date}</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-2">{comment.text}</p>
          
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {comment.attachments.map((att) => (
                <a 
                  key={att.id}
                  href={att.data}
                  download={att.name}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {att.type.startsWith('image/') ? (
                    <ImageIcon className="w-3 h-3 text-blue-500" />
                  ) : (
                    <File className="w-3 h-3 text-blue-500" />
                  )}
                  <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{att.name}</span>
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onReply(comment.id, comment.author)}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 uppercase tracking-wider"
            >
              <Reply className="w-3 h-3" /> Válasz
            </button>
            <Reactions 
              reactions={comment.reactions || {}} 
              userReaction={comment.userReaction}
              onReact={(emoji) => onReact(comment.id, emoji)}
            />
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              onReply={onReply} 
              onReact={onReact}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'experience' | 'project' | 'help'>('all');
  
  // Modal state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [modalViewMode, setModalViewMode] = useState<'side' | 'stacked'>('side');
  
  // New post form state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'experience' | 'project' | 'help'>('experience');
  const [newPostAttachments, setNewPostAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New comment state
  const [commentText, setCommentText] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<Attachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; author: string } | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setCurrentUser(JSON.parse(savedProfile));
    }

    const savedPosts = localStorage.getItem('community_posts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        // Ensure all posts have reactions object
        const sanitizedPosts = parsedPosts.map((post: any) => ({
          ...post,
          reactions: post.reactions || {},
          comments: (post.comments || []).map((comment: any) => ({
            ...comment,
            reactions: comment.reactions || {},
            replies: (comment.replies || []).map((reply: any) => ({
              ...reply,
              reactions: reply.reactions || {}
            }))
          }))
        }));
        setPosts(sanitizedPosts);
      } catch (e) {
        console.error("Error parsing community posts", e);
        setPosts(INITIAL_POSTS);
      }
    } else {
      setPosts(INITIAL_POSTS);
      localStorage.setItem('community_posts', JSON.stringify(INITIAL_POSTS));
    }

    const savedViewMode = localStorage.getItem('community_modal_view');
    if (savedViewMode === 'side' || savedViewMode === 'stacked') {
      setModalViewMode(savedViewMode);
    }
  }, []);

  const toggleViewMode = () => {
    const newMode = modalViewMode === 'side' ? 'stacked' : 'side';
    setModalViewMode(newMode);
    localStorage.setItem('community_modal_view', newMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'post' | 'comment') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          data: reader.result as string
        };
        if (target === 'post') {
          setNewPostAttachments([...newPostAttachments, newAttachment]);
        } else {
          setCommentAttachments([...commentAttachments, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser?.name || 'Vendég',
      authorAvatar: currentUser?.avatar || 'https://picsum.photos/seed/guest/200/200',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      attachments: newPostAttachments,
      reactions: {},
      comments: [],
      date: new Date().toISOString().split('T')[0]
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
    
    // Reset form
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('experience');
    setNewPostAttachments([]);
    setIsPosting(false);
  };

  const handleShare = async (post: Post) => {
    if (isSharing) return;

    const shareData = {
      title: post.title,
      text: post.content,
      url: window.location.href
    };

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link másolva a vágólapra!');
      }
    } catch (err: any) {
      // Don't log if user simply cancelled the share
      if (err.name !== 'AbortError') {
        console.error('Hiba a megosztás során:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddComment = (postId: string, parentCommentId?: string) => {
    if (!commentText.trim() && commentAttachments.length === 0) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser?.name || 'Vendég',
      authorAvatar: currentUser?.avatar || 'https://picsum.photos/seed/guest/200/200',
      text: commentText,
      attachments: commentAttachments,
      date: new Date().toISOString().split('T')[0],
      replies: []
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (parentCommentId) {
          // Add as reply
          const updateReplies = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === parentCommentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment]
                };
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateReplies(comment.replies)
                };
              }
              return comment;
            });
          };
          return {
            ...post,
            comments: updateReplies(post.comments)
          };
        } else {
          // Add as top-level comment
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
    
    // Trigger notification for post author
    const post = posts.find(p => p.id === postId);
    if (post && post.author !== (currentUser?.name || 'Vendég')) {
      addNotification({
        userId: post.author, // Using author name as proxy for userId in this mock
        type: 'comment',
        title: 'Új hozzászólás a posztodhoz',
        message: `${currentUser?.name || 'Vendég'} hozzászólt a "${post.title}" bejegyzésedhez.`,
        link: `/community` // In a real app, this would link to the specific post
      });
    }

    // Update selectedPost if modal is open
    if (selectedPost && selectedPost.id === postId) {
      const updatedSelectedPost = updatedPosts.find(p => p.id === postId);
      if (updatedSelectedPost) setSelectedPost(updatedSelectedPost);
    }

    setCommentText('');
    setCommentAttachments([]);
    setReplyingTo(null);
  };

  const handleReaction = (postId: string, emoji: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const reactions = { ...post.reactions };
        const currentReaction = post.userReaction;

        if (currentReaction === emoji) {
          // Remove reaction
          reactions[emoji] = Math.max(0, (reactions[emoji] || 0) - 1);
          return { ...post, reactions, userReaction: undefined };
        } else {
          // Change or add reaction
          if (currentReaction) {
            reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 0) - 1);
          }
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...post, reactions, userReaction: emoji };
        }
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
    
    // Trigger notification for post author
    const post = posts.find(p => p.id === postId);
    if (post && post.author !== (currentUser?.name || 'Vendég') && emoji) {
      // Only notify if it's a new reaction or change, not removal
      const updatedPost = updatedPosts.find(p => p.id === postId);
      if (updatedPost?.userReaction === emoji) {
        addNotification({
          userId: post.author,
          type: 'reaction',
          title: 'Új reakció a posztodra',
          message: `${currentUser?.name || 'Vendég'} reagált a "${post.title}" bejegyzésedre: ${emoji}`,
          link: `/community`
        });
      }
    }

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
    }
  };

  const handleCommentReaction = (postId: string, commentId: string, emoji: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updateComments = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const reactions = { ...(comment.reactions || {}) };
              const currentReaction = comment.userReaction;

              if (currentReaction === emoji) {
                reactions[emoji] = Math.max(0, (reactions[emoji] || 0) - 1);
                return { ...comment, reactions, userReaction: undefined };
              } else {
                if (currentReaction) {
                  reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 0) - 1);
                }
                reactions[emoji] = (reactions[emoji] || 0) + 1;
                return { ...comment, reactions, userReaction: emoji };
              }
            }
            if (comment.replies) {
              return { ...comment, replies: updateComments(comment.replies) };
            }
            return comment;
          });
        };
        return { ...post, comments: updateComments(post.comments) };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));

    // Trigger notification for comment author
    const findComment = (comments: Comment[]): Comment | undefined => {
      for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies) {
          const found = findComment(comment.replies);
          if (found) return found;
        }
      }
      return undefined;
    };

    const post = posts.find(p => p.id === postId);
    if (post) {
      const comment = findComment(post.comments);
      if (comment && comment.author !== (currentUser?.name || 'Vendég') && emoji) {
        // Find updated comment to check if reaction was added
        const updatedPost = updatedPosts.find(p => p.id === postId);
        if (updatedPost) {
          const updatedComment = findComment(updatedPost.comments);
          if (updatedComment?.userReaction === emoji) {
            addNotification({
              userId: comment.author,
              type: 'reaction',
              title: 'Új reakció a hozzászólásodra',
              message: `${currentUser?.name || 'Vendég'} reagált a hozzászólásodra: ${emoji}`,
              link: `/community`
            });
          }
        }
      }
    }

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || post.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return <CheckCircle2 className="w-4 h-4" />;
      case 'project': return <Rocket className="w-4 h-4" />;
      case 'help': return <HelpCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'experience': return 'Tapasztalat';
      case 'project': return 'Projekt';
      case 'help': return 'Segítségkérés';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experience': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'project': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'help': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return '';
    }
  };

  const renderPostContent = (post: Post) => (
    <div className={`p-8 md:p-12 border-white/5 custom-scrollbar ${modalViewMode === 'side' ? 'flex-1 overflow-y-auto border-b md:border-b-0 md:border-r' : 'w-full border-b'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-blue-400">
              <User className="w-6 h-6" />
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-lg">{post.author}</h4>
          <p className="text-sm text-gray-500">{post.date}</p>
        </div>
        <div className={`ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getCategoryColor(post.category)}`}>
          {getCategoryIcon(post.category)}
          {getCategoryLabel(post.category)}
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h2>
      <p className="text-gray-400 text-lg leading-relaxed mb-8 whitespace-pre-wrap">{post.content}</p>

      <div className="flex items-center gap-6 mb-8 py-6 border-y border-white/5">
        <Reactions 
          reactions={post.reactions} 
          userReaction={post.userReaction}
          onReact={(emoji) => handleReaction(post.id, emoji)}
        />
        <div className="flex items-center gap-2 text-gray-500">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-bold">{post.comments.length}</span>
        </div>
        <button 
          onClick={() => handleShare(post)}
          className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors ml-auto"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {post.attachments && post.attachments.length > 0 && (
        <div className="space-y-6">
          {post.attachments.map((att) => (
            <div key={att.id} className="rounded-3xl overflow-hidden border border-white/5 bg-white/5 group relative">
              {att.type.startsWith('image/') ? (
                <img src={att.data} alt="" className="w-full object-contain max-h-[500px]" />
              ) : (
                <div className="p-8 flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                    <File className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-lg truncate">{att.name}</h5>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">{att.type.split('/')[1] || 'Fájl'}</p>
                  </div>
                  <a 
                    href={att.data} 
                    download={att.name}
                    className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCommentsSection = (post: Post) => (
    <div className={`flex flex-col bg-[#0a0a0a] ${modalViewMode === 'side' ? 'w-full md:w-[400px]' : 'w-full'}`}>
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Hozzászólások ({post.comments.length})
        </h3>
      </div>

      <div className={`p-6 space-y-6 custom-scrollbar ${modalViewMode === 'side' ? 'flex-1 overflow-y-auto' : 'w-full'}`}>
        {post.comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm italic">Még nincsenek hozzászólások. Legyél te az első!</p>
          </div>
        ) : (
          post.comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={post.id}
              onReply={(id, author) => setReplyingTo({ commentId: id, author })}
              onReact={(commentId, emoji) => handleCommentReaction(post.id, commentId, emoji)}
            />
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="p-6 border-t border-white/5 bg-[#0d0d0d]">
        {replyingTo && (
          <div className="mb-3 flex items-center justify-between bg-blue-600/10 px-3 py-2 rounded-lg border border-blue-500/20">
            <span className="text-xs text-blue-400 font-medium flex items-center gap-2">
              <Reply className="w-3 h-3" /> Válasz neki: <strong>{replyingTo.author}</strong>
            </span>
            <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Írj egy hozzászólást..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-20 text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1">
            <EmojiPickerButton 
              onEmojiSelect={(emoji) => setCommentText(prev => prev + emoji)} 
            />
            <button 
              onClick={() => handleAddComment(post.id, replyingTo?.commentId)}
              disabled={!commentText.trim() && commentAttachments.length === 0}
              className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button 
            onClick={() => commentFileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <Paperclip className="w-4 h-4" />
            Fájl csatolása
          </button>
          <input 
            type="file"
            ref={commentFileInputRef}
            onChange={(e) => handleFileUpload(e, 'comment')}
            className="hidden"
          />
        </div>

        {commentAttachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {commentAttachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="text-[10px] text-gray-400 truncate">{att.name}</span>
                </div>
                <button onClick={() => setCommentAttachments(commentAttachments.filter(a => a.id !== att.id))}>
                  <X className="w-3 h-3 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            >
              AI Közösségi <span className="text-blue-600">Hub</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Oszd meg tapasztalataidat, mutasd be projektjeidet, vagy kérj segítséget a közösségtől.
            </motion.p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
            {isLoggedIn && !isPosting && (
              <button 
                onClick={() => setIsPosting(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-blue-600/20 order-first"
              >
                <Plus className="w-5 h-5" />
                <span>Új poszt</span>
              </button>
            )}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="Keresés a posztok között..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {(['all', 'experience', 'project', 'help'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                    activeFilter === filter 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {filter === 'all' ? 'Összes' : getCategoryLabel(filter)}
                </button>
              ))}
            </div>
          </div>

          {/* Create Post Form */}
          {isLoggedIn && isPosting && (
            <div className="mb-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8"
              >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Új bejegyzés létrehozása</h2>
                    <button onClick={() => setIsPosting(false)} className="text-gray-500 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreatePost} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Kategória</label>
                        <div className="flex gap-2">
                          {(['experience', 'project', 'help'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setNewPostCategory(cat)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                                newPostCategory === cat
                                  ? getCategoryColor(cat)
                                  : 'bg-white/5 border-white/10 text-gray-500'
                              }`}
                            >
                              {getCategoryLabel(cat)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Cím</label>
                        <input 
                          type="text"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="Miről szól a posztod?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tartalom</label>
                      <div className="relative">
                        <textarea 
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Írd le a részleteket..."
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500 resize-none"
                        />
                        <div className="absolute right-3 bottom-3">
                          <EmojiPickerButton 
                            onEmojiSelect={(emoji) => setNewPostContent(prev => prev + emoji)} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <Paperclip className="w-5 h-5 text-blue-500" />
                          Fájl csatolása
                        </button>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(e, 'post')}
                          className="hidden"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={!newPostTitle || !newPostContent}
                        className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Közzététel
                      </button>
                    </div>

                    {newPostAttachments.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newPostAttachments.map((att) => (
                          <div key={att.id} className="relative group bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                            {att.type.startsWith('image/') ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                <img src={att.data} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                                <File className="w-5 h-5 text-blue-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-300 truncate">{att.name}</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setNewPostAttachments(newPostAttachments.filter(a => a.id !== att.id))}
                              className="text-gray-500 hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </form>
                </motion.div>
              </div>
            )}

          {/* Feed */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedPost(post)}
                  className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="p-6 md:p-8">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10">
                          {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-200">{post.author}</h4>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(post.category)}`}>
                        {getCategoryIcon(post.category)}
                        {getCategoryLabel(post.category)}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{post.title}</h3>
                      <p className="text-gray-400 leading-relaxed line-clamp-3">{post.content}</p>
                      
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          {post.attachments.slice(0, 2).map((att) => (
                            <div key={att.id} className="rounded-2xl overflow-hidden border border-white/5 aspect-video relative">
                              {att.type.startsWith('image/') ? (
                                <img src={att.data} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center gap-2">
                                  <File className="w-8 h-8 text-blue-500" />
                                  <span className="text-xs text-gray-400 px-4 text-center truncate w-full">{att.name}</span>
                                </div>
                              )}
                              {post.attachments!.length > 2 && att.id === post.attachments![1].id && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                  <span className="text-xl font-bold text-white">+{post.attachments!.length - 2}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/5">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Reactions 
                          reactions={post.reactions} 
                          userReaction={post.userReaction}
                          onReact={(emoji) => handleReaction(post.id, emoji)}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-bold">{post.comments.length}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                        className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors ml-auto"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Nincs találat</h3>
                <p className="text-gray-500">Próbálkozz más keresési kifejezéssel vagy szűrővel.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-5xl h-full max-h-[90vh] bg-[#0d0d0d] border border-white/10 rounded-[2rem] flex ${modalViewMode === 'side' ? 'flex-col md:flex-row overflow-hidden' : 'flex-col overflow-y-auto custom-scrollbar'}`}
            >
              <div className="absolute top-6 right-6 z-10 flex gap-2">
                <button 
                  onClick={toggleViewMode}
                  title={modalViewMode === 'side' ? 'Váltás egymás alatti nézetre' : 'Váltás egymás melletti nézetre'}
                  className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  {modalViewMode === 'side' ? <MoreVertical className="w-5 h-5 rotate-90" /> : <MoreVertical className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {renderPostContent(selectedPost)}
              {renderCommentsSection(selectedPost)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
