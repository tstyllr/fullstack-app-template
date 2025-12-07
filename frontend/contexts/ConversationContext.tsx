import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConversationContextType {
   currentConversationId: string | null;
   setCurrentConversationId: (id: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
   undefined
);

export function ConversationProvider({ children }: { children: ReactNode }) {
   const [currentConversationId, setCurrentConversationId] = useState<
      string | null
   >(null);

   return (
      <ConversationContext.Provider
         value={{ currentConversationId, setCurrentConversationId }}
      >
         {children}
      </ConversationContext.Provider>
   );
}

export function useConversationContext() {
   const context = useContext(ConversationContext);
   if (!context) {
      throw new Error(
         'useConversationContext must be used within ConversationProvider'
      );
   }
   return context;
}
